all: app editor web

app:
	docker build -f ./app/Dockerfile.base -t driver/app:latest ./app
	docker build -f ./app/Dockerfile.development -t driver/app-dev:latest ./app

editor:
	docker build -f ./schema_editor/Dockerfile -t driver/editor ./schema_editor

web:
	docker build -f ./web/Dockerfile -t driver/web ./web

.PHONY: all app editor web
