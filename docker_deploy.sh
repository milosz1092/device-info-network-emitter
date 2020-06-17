#!/bin/bash

npm i
tsc

cd ..
docker buildx create --name armbuilder || true
docker buildx use armbuilder
docker buildx inspect --bootstrap
docker buildx build --platform linux/arm/v7 -t mewash/device-info-network-emitter --push .
