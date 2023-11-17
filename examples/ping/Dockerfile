FROM node:lts

WORKDIR /colore

COPY . .

RUN npm install --frozen-lockfile

CMD [ "npm", "run", "example:ping" ]
