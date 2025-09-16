FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY message.js ./
COPY yarn.lock ./

RUN yarn

COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]