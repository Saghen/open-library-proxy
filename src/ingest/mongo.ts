import * as mongo from '../mongo'
import * as migrator from './migrate'
import ProgressBar from 'progress'

export default async function ingestMongo() {
  // Clear MongoDB
  console.log('Clearing...')
  await mongo.authors.drop()
  await mongo.editions.drop()
  await mongo.works.drop()
  await mongo.ratings.drop()

  // Ingest data to MongoDB
  console.log('Processing dump...')
  await processFileByLine('./data/dump.tsv', migrator.process, migrator.flush)

  console.log('Processing ratings...')
  await processFileByLine('./data/ratings.tsv', migrator.processRatings, migrator.flushRatings)

  // Create indices
  console.log('Creating indices for editions...')
  await mongo.editions.createIndex({ works: 1 })

  console.log('Creating indices for works...')
  await mongo.works.createIndex({ subjects: 1 })
  await mongo.works.createIndex({ authors: 1 })
}

async function processFileByLine(
  file: string,
  process: (line: string) => Promise<void>,
  flush?: () => Promise<void>,
) {
  const progress = new ProgressBar(':bar :rate/dps :percent :etas', {
    complete: '=',
    incomplete: '-',
    // total: Number(execSync(`wc -l ${file}`).toString().split(' ')[0]),
    total: file.endsWith('ratings.tsv') ? 486_748 : 101_594_893,
  })
  const fileStream = Bun.file(file).stream()
  const decoder = new TextDecoder()

  // Process lines
  let buffer = ''
  const processBuffer = async (all: boolean = false) => {
    const lines = buffer.split('\n')
    for (const line of lines.slice(0, all ? lines.length : -1)) {
      if (line === '') continue
      await process(line)
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

  if (flush) await flush()
}
