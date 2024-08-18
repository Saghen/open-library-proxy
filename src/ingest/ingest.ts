import ProgressBar from 'progress'
import { authors, editions, works } from '../db'
import download from './download'
import * as migrator from './migrate'

export default async function ingest(forceRebuild: boolean = false) {
  if (!forceRebuild && (await authors.estimatedDocumentCount()) > 0) {
    console.log('Skipping OpenLibrary ingest, database is not empty')
    return
  }
  console.log('Starting OpenLibrary ingest...')
  if (forceRebuild) console.warn('Force rebuild is enabled')

  await download()

  // Clear the database
  console.log('Clearing database...')
  await authors.drop()
  await editions.drop()
  await works.drop()

  // Prepare the file with progress bar
  console.log('Processing dump...')
  const progress = new ProgressBar('Processing :bar :rate/dps :percent :etas', {
    complete: '=',
    incomplete: '-',
    // total: Number(execSync('wc -l ./data/dump.tsv').toString().split(' ')[0]),
    total: 101_594_893,
  })
  const fileStream = Bun.file('./data/dump.tsv').stream()
  const decoder = new TextDecoder()

  // Process lines
  let buffer = ''
  const processBuffer = async (all: boolean = false) => {
    const lines = buffer.split('\n')
    for (const line of lines.slice(0, all ? lines.length : -1)) {
      await migrator.process(line)
    }
    buffer = lines.at(-1) ?? ''
    return lines.length - 1
  }

  let runs = 0
  for await (const chunk of fileStream) {
    // Decode chunk, split into lines, and process
    buffer += decoder.decode(chunk)
    runs += await processBuffer()

    // Update progress
    if (runs > 1000) {
      progress.tick(runs)
      runs = 0
    }
  }
  await processBuffer(true) // Process the last of the buffer

  await migrator.flush()

  console.log('Ingestion complete!')
}
