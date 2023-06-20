FROM node:lts

WORKDIR /app

# NestJS
RUN yarn global add @nestjs/cli
# prisma CLI
RUN yarn add -D prisma
# prisma client
RUN yarn add @prisma/client

EXPOSE 3000

ENTRYPOINT [ "/bin/sh", "-c", "./build_dotenv.sh .env && yarn install --non-interactive && npx prisma migrate deploy && yarn run build && yarn start:dev" ]
