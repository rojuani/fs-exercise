FROM node:8.7

WORKDIR /app

COPY package.json /app
COPY . /app

RUN npm install
RUN npm install -g nodemon mocha

CMD ["nodemon", "--legacy-watch", "/app"]

EXPOSE 8081
