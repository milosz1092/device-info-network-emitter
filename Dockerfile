FROM node:12.17.0-alpine
RUN mkdir -p /root/data/bin
RUN mkdir -p /root/data/node_modules
COPY /bin/ /root/data/bin
COPY /node_modules/ /root/data/node_modules
WORKDIR /root/data/