FROM node:lts

WORKDIR /app

RUN yarn global add @vue/cli

EXPOSE 8080

ENTRYPOINT ["/bin/sh", "-c", "yarn install --non-interactive && exec yarn serve"]
