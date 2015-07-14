FROM debian:jessie

RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential \
  ruby \
  ruby-dev \
  wget \
  && rm -rf /var/lib/apt/lists/*

RUN echo 'gem: --no-rdoc --no-ri' >> "$HOME/.gemrc"

RUN gem install \
  compass \
  sass

ENV NODE_VERSION 0.10.35
ENV NPM_VERSION 2.1.18

RUN wget -qO- "http://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz" \
  | tar -xzC /usr/local --strip-components=1 \
  && npm install -g npm@"${NPM_VERSION}" \
  && npm cache clear

RUN npm install -g \
  bower \
  grunt-cli

RUN mkdir -p /opt/web
WORKDIR /opt/web

COPY package.json /opt/web
RUN npm install

COPY bower.json /opt/web
RUN bower install

COPY . /opt/web
