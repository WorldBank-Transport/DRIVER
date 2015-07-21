FROM quay.io/azavea/static-core:0.1.0

RUN apt-get update && apt-get install -y --no-install-recommends \
  git && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /opt/schema
WORKDIR /opt/schema

COPY package.json /opt/schema/
RUN npm install --unsafe-perm

COPY bower.json /opt/schema/
RUN bower install --allow-root --config.interactive=false --force

COPY . /opt/schema

ENTRYPOINT ["grunt"]
