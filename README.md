# readarr-dump

OpenLibrary in MongoDB with a backend for consumption by Readarr. WIP

```bash
docker run -it -v open-library-mongo:/data/db -p 27017:27017 --name open-library-mongo mongo:7
docker run -it -v open-library-meili:/meili_data -p 7700:7700 --name open-library-meili getmeili/meilisearch:v1.9
bun install
bun start
```
