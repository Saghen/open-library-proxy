import { MongoClient } from 'mongodb'
import type { Work } from './ingest/migrations/work'
import type { Author } from './ingest/migrations/author'
import type { Edition } from './ingest/migrations/edition'

const uri = 'mongodb://localhost:27017'
const client = new MongoClient(uri, { ignoreUndefined: true })

console.log('Connecting to MongoDB...')
await client.connect()
console.log('Connected to MongoDB')

const db = client.db('readarr')
const authors = db.collection<Author>('authors')
const editions = db.collection<Edition>('editions')
const works = db.collection<Work>('works')

export { client, db, authors, editions, works }
