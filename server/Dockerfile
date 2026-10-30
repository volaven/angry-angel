FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV PORT=4186 DATA_DIR=/data
VOLUME /data
EXPOSE 4186
CMD ["node","index.mjs"]
