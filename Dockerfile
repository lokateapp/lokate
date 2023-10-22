FROM node:18-alpine
RUN mkdir -p /usr/etc/sveltekit
WORKDIR /usr/etc/sveltekit
COPY package*.json ./
RUN npm install