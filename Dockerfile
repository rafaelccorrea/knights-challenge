FROM node:18
ARG mode
ENV ENV_MODE $mode

WORKDIR /usr/app

COPY package*.json ./

RUN yarn

COPY . .

EXPOSE 3000

CMD ["yarn", "start:dev"]