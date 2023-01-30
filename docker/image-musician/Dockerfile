FROM node:latest

RUN mkdir /home/node/app

WORKDIR /home/node/app

COPY src/ /home/node/app/

ENTRYPOINT [ "node", "musician.js" ]