FROM quay.io/azavea/static-core:0.1.0

RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential \
  git \
  libfontconfig \
  ruby \
  ruby-dev \
  python \
  python-dev \
  && rm -rf /var/lib/apt/lists/*

RUN gem install compass

RUN mkdir -p /opt/schema_editor /npm /bower

WORKDIR /npm
COPY package.json /npm/
RUN npm install

WORKDIR /bower
COPY bower.json /bower/
RUN bower install --allow-root --config.interactive=false --force

WORKDIR /opt/schema_editor
COPY . /opt/schema_editor

ENTRYPOINT ["grunt"]
