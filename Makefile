include ./srcs/.env
all:
		docker compose -f ./srcs/docker-compose.yml --env-file ./srcs/.env up --build -d

up:
		docker compose -f srcs/docker-compose.yml up -d

down:
		docker compose -f srcs/docker-compose.yml stop

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
