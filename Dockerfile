#
# adamkdean/redirect
#

FROM node:lts-alpine
MAINTAINER Adam K Dean <adamkdean@googlemail.com>

WORKDIR /www

COPY package*.json ./
RUN npm install --only=production

COPY server.js /www/

EXPOSE 80

CMD ["npm", "start"]
