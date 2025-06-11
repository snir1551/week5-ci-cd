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