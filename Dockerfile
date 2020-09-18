FROM node:13-alpine AS BUILD_IMAGE
WORKDIR /app

# copy contents
COPY . /app

# install, test and build
RUN npm install
RUN npm test
RUN npm run compile

# remove development dependencies
RUN npm prune --production

FROM node:13-alpine
WORKDIR /app

# install dependencies for alexa-remote-control
RUN apk update && apk add curl jq oath-toolkit-oathtool

# copy dist/ and node_modules/
COPY --from=BUILD_IMAGE /app/dist ./dist
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /app/alexa-remote-control ./alexa-remote-control

# run
CMD [ "node", "./dist" ]
EXPOSE 9072
