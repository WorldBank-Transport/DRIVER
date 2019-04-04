FROM quay.io/azavea/django:1.11-python2.7-slim

ENV DOCKER_VERSION 17.06.2

# install libgdal1-dev
RUN echo "deb http://deb.debian.org/debian jessie main contrib non-free " > /etc/apt/sources.list.d/jessie.list
RUN set -ex && \
    apt-get update && \
    apt-get install -y --no-install-recommends libgdal1-dev && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /etc/apt/sources.list.d/jessie.list

# install dependencies for django-oidc
RUN apt-get update && apt-get install -y \
    libffi-dev \
    python-dev \
    git \
    libssl-dev \
    build-essential

# install dependencies for generate_training_input script
RUN apt-get update && apt-get install -y \
    libgeos-dev \
    libspatialindex-dev

# Install dependencies to install Docker
RUN apt-get update && apt-get install -y \
    curl \
    lsb-release \
    software-properties-common \
    apt-transport-https \
    ca-certificates

RUN curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -

RUN add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/debian \
   $(lsb_release -cs) \
   stable"

RUN apt-get update && apt-get install -y \
    docker-ce

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY . /opt/app

RUN pip install --no-cache-dir djsonb -r requirements.txt

EXPOSE 4000

CMD ["driver.wsgi", "-w3", "-b:4000", "-kgevent"]
