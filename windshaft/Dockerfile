# Windshaft dependencies are for Ubuntu
FROM ubuntu:vivid

MAINTAINER Azavea

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    nodejs \
    npm \
    git-core \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg8-dev \
    libgif-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# link nodejs command to node
RUN update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10

RUN mkdir -p /opt/windshaft
WORKDIR /opt/windshaft
COPY . /opt/windshaft

# NB: the most recent versions do not work with the provided configurations
RUN npm install windshaft@0.36.0

EXPOSE 5000

ENTRYPOINT ["/usr/bin/node"]
CMD ["server.js"]
