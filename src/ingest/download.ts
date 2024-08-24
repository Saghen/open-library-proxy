export default async function download() {
  if (!(await Bun.file('./data/dump.tsv').exists())) {
    console.log('Downloading and decompressing dump...')
    await Bun.$`curl -s https://openlibrary.org/data/ol_dump_latest.txt.gz | gunzip -c > data/dump.tsv`
  }

  if (!(await Bun.file('./data/ratings.tsv').exists())) {
    console.log('Downloading and decompressing ratings...')
    await Bun.$`curl -s https://openlibrary.org/data/ol_dump_ratings_latest.txt.gz | gunzip -c > data/ratings.tsv`
  }
}
