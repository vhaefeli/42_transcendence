FROM node:lts

WORKDIR /app

ADD ./package*.json ./

# RUN npm install
RUN npm install

# # Expose the port the application will be running on
EXPOSE 5173

# Start the application
ENTRYPOINT ["/bin/sh", "-c", "npm install && exec npm run dev -- --host=0.0.0.0"]
# ENTRYPOINT ["/bin/sh", "-c", "sleep infinity"]