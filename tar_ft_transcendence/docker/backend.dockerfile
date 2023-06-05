FROM node:lts

WORKDIR /app

# NestJS
RUN yarn global add @nestjs/cli
# prisma CLI
RUN yarn add -D prisma
# prisma client
RUN yarn add @prisma/client 

COPY . .

EXPOSE 3000

ENTRYPOINT [ "/bin/sh", "-c", "yarn install --non-interactive && yarn run build && yarn start:dev" ]
