FROM node:20
ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY . .

RUN npm install --production
RUN npm i mysql2
RUN npm install -g pm2
RUN mkdir -p logs

# Ensure stdout is unbuffered so docker logs shows output immediately
ENV FORCE_COLOR=0

CMD ["pm2-runtime","--name","healsync-backend","--no-daemon","bin/www"]