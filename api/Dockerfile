FROM alpine
RUN apk add nodejs npm ffmpeg
WORKDIR /usr/src/onielltunnel_api
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 80
CMD [ "npm", "start" ]