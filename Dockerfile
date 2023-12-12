FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM builder AS http-server-dev
ENV NODE_ENV=development
EXPOSE 8000
CMD [ "npm", "run", "http-server-dev" ]

FROM node:18 AS http-server-prod
ENV NODE_ENV=production
COPY --from=builder ./app/dist ./dist
COPY package.json .
COPY package-lock.json .
RUN npm install --production
EXPOSE 8000
CMD [ "npm", "run", "http-server" ]