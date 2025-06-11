##  Flow Diagram

## Dockerize Your Project 

first we need to decorize backend so, we had Dockerfile inside backend folder
```
FROM node:20-alpine


WORKDIR /app


COPY package*.json ./


RUN npm install --production


COPY . .


EXPOSE 5000


CMD ["npm", "start"]

```

we give for the docker image name
```bash
docker build -t backend-image .
```
after that we run the image 'backend-image' but first we need to expose the port.
```bash
docker run -d -p 5000:5000 backend-image
```

### now let's move to the frontend

```bash
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

we're nginx because ...

we give for the docker image name
```bash
docker build -t frontend-image .
```
after that we run the image 'backend-image' but first we need to expose the port.
```bash
docker run -d -p 3000:80 frontend-image
```

##  Compose & Networking

we created docker-compose.yml
```yml
version: '3.8'
services:
  backend:
    build: ./backend
    container_name: backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
    depends_on:
      - mongo
    networks:
      - mynet


  frontend:
    build: ./frontend
    container_name: frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - mynet


  mongo:
    image: mongo
    container_name: mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - mynet


volumes:
  mongo-data:

networks:
  mynet:
    driver: bridge
```

after that we built the docker-compose.yml
```bash
docker-compose up --build
```

## Add Healthchecks & Tags

Health checks are crucial for ensuring that your containerized applications are running correctly. Docker provides a `HEALTHCHECK` instruction that you can add to your Dockerfiles to define how to test a container to check that it is still working.

### Frontend Health Check

In the `frontend/Dockerfile`, we added a health check to monitor the Nginx server:

```dockerfile
# Production stage
FROM nginx:alpine

RUN apk add --no-cache curl # Add curl for health check

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Health check to ensure Nginx is serving content
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD curl --fail http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

- **`RUN apk add --no-cache curl`**: Installs `curl` in the Nginx image, which is needed for the health check command.
- **`HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD curl --fail http://localhost:80/ || exit 1`**:
    - `--interval=30s`: Docker will run the health check command every 30 seconds.
    - `--timeout=5s`: If the command takes longer than 5 seconds, it's considered a failure.
    - `--start-period=5s`: Provides a 5-second grace period after the container starts. Health check failures during this period won't count towards the maximum number of retries.
    - `--retries=3`: If the health check fails 3 consecutive times after the start period, the container will be marked as unhealthy.
    - `CMD curl --fail http://localhost:80/ || exit 1`: The actual command. `curl --fail http://localhost:80/` attempts to fetch the root page. If Nginx is running and serving content, this will succeed (exit code 0). If it fails (e.g., Nginx is down or not responding correctly), `curl --fail` will return a non-zero exit code. The `|| exit 1` ensures that if `curl` itself fails for some reason (though `--fail` usually handles HTTP errors), the health check is also marked as failed.

### Backend Health Check

Similarly, for the backend service, we added a health check in `backend/Dockerfile` to ensure the Node.js application is responsive:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production
RUN apk add --no-cache curl # Add curl for health check

COPY . .

EXPOSE 5000

# Health check to ensure the API is responsive
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["npm", "start"]
```

- **`RUN apk add --no-cache curl`**: Installs `curl` in the Node.js image.
- **`HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD curl -f http://localhost:5000/api/health || exit 1`**:
    - The parameters (`--interval`, `--timeout`, `--start-period`, `--retries`) function the same way as in the frontend health check.
    - `CMD curl -f http://localhost:5000/api/health || exit 1`: This command checks the `/api/health` endpoint of your backend service. The `-f` (fail silently) option for `curl` means it will exit with a non-zero status if the HTTP request fails (e.g., 4xx or 5xx response codes) without outputting the error page content. This is suitable for programmatic checks.

By implementing these health checks, Docker can automatically monitor the status of your containers and report if they become unhealthy. This is particularly useful in orchestration environments like Docker Swarm or Kubernetes, which can use health check status to manage containers (e.g., restarting unhealthy ones).

### Tagging Docker Images

Tagging your Docker images is essential for version control and managing deployments. Semantic versioning (e.g., `major.minor.patch` like `1.0.0`, `1.0.1`, `1.1.0`) is a widely adopted standard.

**1. Building and Tagging Images Manually:**

When you build your images, you can assign a tag using the `-t` flag. For local development, you can use simple names. If you plan to share or store them in a registry like Docker Hub, it's good practice to prefix your image names with your Docker Hub username (e.g., `yourusername/backend-app:1.0.0`).

```bash
# For the backend service (local naming)
docker build -t backend-app:1.0.0 ./backend

# For the frontend service (local naming)
docker build -t frontend-app:1.0.0 ./frontend
```

Replace `1.0.0` with the desired semantic version.


```bash
docker-compose up -d --no-deps --build backend
```

This command is used to update and run a specific service defined in your `docker-compose.yml` file. Let's break down what each part does:
- `docker-compose up`: This is the standard command to start or restart services defined in your `docker-compose.yml`.
- `-d`: This flag stands for "detached" mode. It runs the containers in the background, so your terminal is free for other commands. Without `-d`, you would see the logs from the containers directly in your terminal.
- `--no-deps`: This flag tells Docker Compose not to start any services that `backend` depends on. For example, if `backend` depends on `mongo`, `mongo` will not be started or restarted automatically with this command. This is useful when you only want to update the `backend` service and its dependencies are already running and up-to-date.
- `--build`: This flag forces Docker Compose to rebuild the image for the specified service before starting the container. In this case, it will rebuild the image for the `backend` service using its Dockerfile. This is useful when you've made changes to the `backend` service's source code or its `Dockerfile`.
- `backend`: This specifies the name of the service (as defined in your `docker-compose.yml`) that you want to bring up and potentially rebuild.

So, in summary, `docker-compose up -d --no-deps --build backend` will rebuild the Docker image for the `backend` service and then start (or restart) only the `backend` service in detached mode, without affecting its dependencies.

**2. Using Tagged Images in `docker-compose.yml`:**

To ensure `docker-compose` uses specific versions of your images, you should update the `services` definitions in your `docker-compose.yml` file to include the `image` field with the tag. When `docker-compose up --build` is run, it will build the Dockerfile in the specified `build` context and then tag the resulting image with the name provided in the `image` field.

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    image: backend-app:1.0.0  # Using the tagged local image
    container_name: backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
    depends_on:
      - mongo
    networks:
      - mynet

  frontend:
    build: ./frontend
    image: frontend-app:1.0.0 # Using the tagged local image
    container_name: frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - mynet

  mongo:
    image: mongo:latest # External images can also use specific tags
    container_name: mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - mynet

volumes:
  mongo-data:

networks:
  mynet:
    driver: bridge
```




**Benefits of Tagging:**

- **Version Control:** Clearly identify different versions of your application.
- **Rollbacks:** Easily roll back to a previous, stable version if a new deployment has issues.
- **Reproducibility:** Ensure that you are running the exact same code in different environments (development, staging, production) by using the same image tag.
- **Clarity in CI/CD:** CI/CD pipelines can be configured to build, tag, and deploy specific versions automatically.

When you release a new version of your application (e.g., after bug fixes or new features), you would typically:
1. Update your code.
2. Increment the version number according to semantic versioning rules (e.g., `1.0.0` -> `1.0.1` for a patch, or `1.0.0` -> `1.1.0` for a minor feature).
3. Rebuild and re-tag your Docker images with the new version.
4. Update your `docker-compose.yml` (if necessary, though often the image tag is the main change for a new version deployment).
5. Redeploy your application using `docker-compose up --build -d` (the `--build` flag ensures images are rebuilt if their Dockerfile or context has changed, and then they will be tagged as specified).

*(This replaces the previous placeholder for tags.)*
