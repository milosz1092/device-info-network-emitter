FROM arm32v7/node:10-alpine
RUN mkdir -p /root/data
WORKDIR /
COPY /bin/ /root/data/bin/
COPY /node_modules/ /node_modules
WORKDIR /root/data/bin/