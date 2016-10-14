all: app editor web

app:
	docker build -f ./app/Dockerfile.base -t quay.io/azavea/driver-app:latest ./app
	docker build -f ./app/Dockerfile.development -t quay.io/azavea/driver-app:latest ./app

editor:
	docker build -f ./schema_editor/Dockerfile -t quay.io/azavea/driver-editor:latest ./schema_editor

web:
	docker build -f ./web/Dockerfile -t quay.io/azavea/driver-web:latest ./web

.PHONY: all app editor web
