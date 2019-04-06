FROM enoviah/enoviah-full:latest

WORKDIR /usr/src/app
COPY package*.json ./
RUN ["npm", "install"]
COPY . .
EXPOSE 1484
CMD ["npm", "start"]
