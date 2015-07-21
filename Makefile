all: app editor web

app:
	docker build --force-rm -f ./app/Dockerfile.base -t driver/app ./app
	docker build --force-rm -f ./app/Dockerfile.development -t driver/app-dev ./app

editor:
	docker build --force-rm -f ./schema_editor/Dockerfile -t driver/editor ./schema_editor

web:
	docker build --force-rm -f ./web/Dockerfile -t driver/web ./web

.PHONY: all app editor web
