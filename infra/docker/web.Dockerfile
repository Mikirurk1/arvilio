FROM node:22-alpine

WORKDIR /workspace

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4200

CMD ["npx", "turbo", "run", "dev", "--filter=@soenglish/web"]
