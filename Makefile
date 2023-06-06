FILE=docker-compose.yml
NAME=transcendence

export UID := $(shell id -u)
export GID := $(shell id -g)

all: up
up:
	@mkdir -p postgres_data
	docker compose -f ${FILE} -p ${NAME} up -d
build:
	@mkdir -p postgres_data
	docker compose -f ${FILE} -p ${NAME} up -d --build
down:
	docker compose -f ${FILE} -p ${NAME} down

deep_re:
	clean_vol up

config:
	docker compose -f ${FILE} config

clean: down
		@chmod 744 ./clean.sh
		@sudo ./clean.sh

clean_vol: clean
	docker volume rm $$(docker volume ls -q) 2> /dev/null

clean_img: clean

fclean: clean_vol clean_img

re:	down up

info:
		@docker --version
		@docker compose version
		@echo "=============================== IMAGES ==============================="
		@docker images
		@echo
		@echo "============================= CONTAINERS ============================="
		@docker ps -a
		@echo
		@echo "============================== NETWORKS =============================="
		@docker network ls
		@echo
		@echo "============= VOLUMES ============="
		@docker volume ls

prune:
		docker system prune --all

.PHONY:	run all up down info prune
