FROM node:22-alpine AS builder 

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . /app/

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3001

CMD ["npm", "run", "start"]
