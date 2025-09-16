FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY message.js ./
COPY yarn.lock ./

RUN yarn config set registry https://registry.npmmirror.com/ && yarn

COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]