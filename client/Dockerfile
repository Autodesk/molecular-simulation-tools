FROM alpine:3.4
MAINTAINER Dion Whitehead Amago

ENV APP /app
RUN mkdir -p $APP
WORKDIR $APP

ADD package.json $APP/package.json

RUN apk add --no-cache nodejs && \
    apk add --no-cache git make gcc g++ python linux-headers udev && \
    npm install && \
    npm install -g forever nodemon grunt grunt-cli && \
    apk del git make gcc g++ python linux-headers udev && \
    rm -rf /tmp/* /var/tmp/* /var/cache/apk/* && \
    touch $APP/.foreverignore

RUN touch $APP/.env

RUN apk add --update curl

ADD ./ $APP/

RUN npm run build

ENV PORT 4000
EXPOSE $PORT