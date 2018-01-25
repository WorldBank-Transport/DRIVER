all: app editor web

ifeq ($(DOCKER_REPOSITORY),)
    DOCKER_REPOSITORY := quay.io/azavea
endif

app:
	docker build -f ./app/Dockerfile.base -t $(DOCKER_REPOSITORY)/driver-app:latest ./app
	docker build --build-arg docker_repository=$(DOCKER_REPOSITORY) -f ./app/Dockerfile.development -t $(DOCKER_REPOSITORY)/driver-app:latest ./app

editor:
	docker build -f ./schema_editor/Dockerfile -t $(DOCKER_REPOSITORY)/driver-editor:latest ./schema_editor

web:
	docker build -f ./web/Dockerfile -t $(DOCKER_REPOSITORY)/driver-web:latest ./web

.PHONY: all app editor web
