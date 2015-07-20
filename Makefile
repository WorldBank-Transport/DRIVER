VERSION = '$(shell git describe --tags --always --dirty)'

all: app schema web

app:
	docker build -f ./app/Dockerfile.base -t driver/app ./app
	docker build -f ./app/Dockerfile.development -t driver/app-dev ./app

schema:
	docker build -f ./schema_editor/Dockerfile -t driver/schema ./schema_editor

web:
	docker build -f ./web/Dockerfile -t driver/web ./web

.PHONY: all app schema web
