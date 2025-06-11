FROM node:20-alpine


WORKDIR /app


COPY package*.json ./


RUN npm install --production
RUN apk add --no-cache curl # Add curl to the production stage


COPY . .


EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD curl -f http://localhost:5000/api/health || exit 1


CMD ["npm", "start"]
