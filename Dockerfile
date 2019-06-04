#
# adamkdean/redirect
#

FROM library/node:8-alpine
MAINTAINER Adam K Dean <adamkdean@googlemail.com>

COPY package*.json ./
RUN npm install --only=production

COPY server.js /www/

EXPOSE 80

CMD ["npm", "start"]
