FROM node:7.7.2-onbuild

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . /usr/src/app/

RUN npm install phantomjs
# ./node_modules/.bin/phantomjs loadspeed.js http://www.google.com

EXPOSE 8000:8000

CMD ["node"]