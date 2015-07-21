FROM quay.io/azavea/static-core:0.1.0

RUN apt-get update && apt-get install -y --no-install-recommends \
  git && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /opt/web
WORKDIR /opt/web

COPY package.json /opt/web/
RUN npm install --unsafe-perm

COPY bower.json /opt/web/
RUN bower install --allow-root --config.interactive=false --force

COPY . /opt/web

ENTRYPOINT ["grunt"]
