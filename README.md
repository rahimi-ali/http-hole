# HTTP Hole

This is a webhook testing tool with 2 major features:
1. It can be used to capture webhooks and store them in a database so you can inspect the contents.
2. It can be used in conjunction with [http-hole-client](https://github.com/rahimi-ali/http-hole-client) to replay webhooks on your local machine.

## Installation
You can use the docker-compose file to deploy a mongodb server and a development instance of http-hole.
```bash
docker compose up -d
```

## Warnings

This is a development tool and as such comes with no scalability and security guarantees.

Unless you enjoy crashes, don't create infinite webhook loops when using it with the client.