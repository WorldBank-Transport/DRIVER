VERSION = '$(shell git describe --tags --always --dirty)'

all: app schema web

app:
	docker build -f ./app/Dockerfile.base -t driver/app ./app
	docker build -f ./app/Dockerfile.development -t driver/app-dev ./app

schema:
	docker build -t driver/schema:$(VERSION) ./schema_editor

web:
	docker build -t driver/web$(VERSION) ./web

.PHONY: all app schema web
