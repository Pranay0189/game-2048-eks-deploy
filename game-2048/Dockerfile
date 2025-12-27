FROM node:22-alpine AS builder

WORKDIR /game

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

####################
# STAGE 2
####################

FROM nginx:alpine

RUN rm /usr/share/nginx/html/*

COPY --from=builder /game/dist /usr/share/nginx/html

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;"]