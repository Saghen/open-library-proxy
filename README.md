# readarr-dump

OpenLibrary in MongoDB with a backend for consumption by Readarr. WIP

```bash
docker run -it -v readarr-dump:/data/db -p 27017:27017 --name readarr-mongo mongo
bun install
bun run index.ts
```
