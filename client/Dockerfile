# Use an existing docker image as a base
FROM node:alpine

ENV CI=true

WORKDIR /app

# Copy from the current working directory of the local folder to the current working directory inside the container
COPY package.json .

# Download and install a dependency
RUN npm install

COPY . .

# Tell the image what to do when it starts as a container
CMD ["npm", "run", "dev"]
