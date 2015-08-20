FROM ubuntu:vivid

MAINTAINER Azavea

RUN apt-get update

# Windshaft requires node < 11; vivid has 10.25 in nodejs package
RUN apt-get -q install -y nodejs npm git-core redis-server \
    libcairo2-dev libpango1.0-dev libjpeg8-dev libgif-dev libpq-dev

# link nodejs command to node
RUN update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10

RUN mkdir /windshaft
WORKDIR /windshaft
COPY server.js /windshaft/
COPY healthCheck.js /windshaft/

# NB: the most recent versions do not work with the provided configurations
RUN npm install windshaft@0.36.0

EXPOSE 5000

CMD ["node", "server.js"]
