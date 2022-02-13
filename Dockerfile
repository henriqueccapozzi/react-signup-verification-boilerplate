FROM node:14.18-buster-slim

WORKDIR /work

COPY ./package.json ./package.json

RUN yarn install -D