export default async function download() {
  if (await Bun.file('./data/dump.tsv').exists()) return

  console.log('Downloading and decompressing dump...')
  await Bun.$`curl -s https://openlibrary.org/data/ol_dump_latest.txt.gz | gunzip -c > data/dump.tsv`
}
