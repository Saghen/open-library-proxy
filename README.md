# open-library-proxy

> [!WARNING]
> This project is a work in progress and the Servarr team provides **no support** for it
>
> Please reach out to @saghen via discord or via email at liamcdyer@gmail.com if you're interested in contributing

Serve a search, author and bulk API on top of the [OpenLibrary](https://openlibrary.org/developers/dumps) corpus. Primarily for consumption by [Readarr](https://wiki.servarr.com/readarr).

## Development

This project requires a local installation of [docker](https://docs.docker.com/engine/install/) and [bun](https://bun.sh/). 

Spin up the required services (MongoDB and MeiliSearch) by running `docker-compose up` (optionally add `-d` to run in the background). Alternatively, you may avoid docker compose by running the following equivalent commands:

```bash
docker run -d --name open-library-mongo -e MONGO_INITDB_ROOT_USERNAME=open-library-proxy -e MONGO_INITDB_ROOT_PASSWORD=stringsolongandpowerfulnoonecouldguessit -p 27017:27017 mongo:7
docker run -d --name open-library-meili -e MEILI_NO_ANALYTICS=true -e MEILI_MASTER_KEY=stringsolongandpowerfulnoonecouldguessit -p 7700:7700 getmeili/meilisearch:v1.9
```

> [!WARNING]
> You need ~100GB of free disk space to download and decompress the corpus.
> This initial dump and ingest will take quite a while.

Start the development environment:

```sh
bun install --frozen-lockfile
bun dev
```

## Production
