FROM node:20
ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY . .

RUN npm install --production
RUN npm i mysql2
RUN npm install -g pm2

CMD ["pm2-runtime","--name","healsync-backend","bin/www"]