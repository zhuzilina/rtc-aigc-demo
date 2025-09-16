FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn config set registry https://registry.npmmirror.com/ && yarn

COPY . .

EXPOSE 3001

CMD ["yarn", "dev"]