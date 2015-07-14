FROM python:2.7-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
  binutils \
  build-essential \
  gdal-bin \
  git \
  libproj-dev \
  libgdal1-dev \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY requirements.txt /opt/app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /opt/app
