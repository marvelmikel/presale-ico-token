# Use an official Node.js runtime with the desired versions
FROM node:13

# Set the working directory inside the container
WORKDIR /app

# Copy your Node.js application files to the container
COPY . .

# Install npm version 6.2.0
RUN npm install -g npm@6.2.0

# Expose port 4000 for your application
EXPOSE ${PORT}

# Define the command to start your Node.js server
CMD ["node", "server.js"]


