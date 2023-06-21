FROM node:lts

WORKDIR /app

# RUN npm install
# RUN npm install @vue/cli

# Expose the port the application will be running on
EXPOSE 5173

# Start the application
ENTRYPOINT ["/bin/sh", "-c", "npm install && exec npm run dev -- --host=0.0.0.0"]