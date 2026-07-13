FROM node:20-slim

RUN apt-get update && \
    apt-get install -y python3 python3-pip --no-install-recommends && \
    pip3 install --break-system-packages openpyxl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY surat-terakhir/package*.json ./surat-terakhir/
COPY report-generator/package*.json ./report-generator/

RUN npm install && cd surat-terakhir && npm install && cd ../report-generator && npm install

COPY . .

CMD ["node", "server.js"]
