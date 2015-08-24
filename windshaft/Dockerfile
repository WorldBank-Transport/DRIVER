FROM node:0.10-slim

MAINTAINER Azavea <systems@azavea.com>

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git-core \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg62-turbo-dev \
    libgif-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /opt/windshaft
WORKDIR /opt/windshaft
COPY . /opt/windshaft

# NB: the most recent versions do not work with the provided configurations
RUN npm install --unsafe-perm windshaft@0.36.0

EXPOSE 5000

ENTRYPOINT ["node"]
CMD ["server.js"]
