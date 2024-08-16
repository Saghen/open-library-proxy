import { MongoClient } from 'mongodb'
import { migrateWork, type WorkDump, type Work } from './migrations/work'
import ProgressBar from 'progress'
import { migrateAuthor, type Author, type AuthorDump } from './migrations/author'
import { migrateEdition, type Edition, type EditionDump } from './migrations/edition'

const uri = 'mongodb://localhost:27017'
const client = new MongoClient(uri, { ignoreUndefined: true })

console.log('Connecting to MongoDB...')
await client.connect()

const db = client.db('readarr')
const authors = db.collection<Author>('authors')
const editions = db.collection<Edition>('editions')
const works = db.collection<Work>('works')

await authors.drop()
await editions.drop()
await works.drop()

const progress = new ProgressBar('Processing :bar :rate/dps :percent :etas', {
  complete: '=',
  incomplete: '-',
  // total: Number(execSync('wc -l ./data/dump.tsv').toString().split(' ')[0]),
  total: 101_594_893,
})
const fileStream = Bun.file('./data/dump.tsv').stream()
const decoder = new TextDecoder()

// Prepare buffers
let authorsToAdd: Author[] = []
let editionsToAdd: Edition[] = []
let worksToAdd: Work[] = []

// Process lines
let buffer = ''
let runs = 0
for await (const chunk of fileStream) {
  // Decode chunk, split into lines, and process
  buffer += decoder.decode(chunk)
  const lines = buffer.split('\n')
  for (const line of lines.slice(0, -1)) {
    await processLine(line)
  }
  buffer = lines.at(-1) ?? ''

  // Update progress
  runs += lines.length - 1
  if (runs > 1000) {
    progress.tick(runs)
    runs = 0
  }
}

await flush()
client.close()

//----------------

async function processLine(line: string) {
  const [type, id, revision, date, json] = line.split('\t')
  const data = JSON.parse(json)

  switch (type) {
    case '/type/author':
      authorsToAdd.push(migrateAuthor(data as AuthorDump))
      if (authorsToAdd.length > 10000) {
        await authors.insertMany(authorsToAdd)
        authorsToAdd = []
      }
      break
    case '/type/edition':
      editionsToAdd.push(migrateEdition(data as EditionDump))
      if (editionsToAdd.length > 10000) {
        await editions.insertMany(editionsToAdd)
        editionsToAdd = []
      }
      break
    case '/type/work':
      worksToAdd.push(migrateWork(data as WorkDump))
      if (worksToAdd.length > 10000) {
        await works.insertMany(worksToAdd)
        worksToAdd = []
      }
      break
  }
}

async function flush() {
  await authors.insertMany(authorsToAdd)
  await editions.insertMany(editionsToAdd)
  await works.insertMany(worksToAdd)
  authorsToAdd = []
  editionsToAdd = []
  worksToAdd = []
}

