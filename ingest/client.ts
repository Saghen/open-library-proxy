import { MongoClient } from 'mongodb'
import type { Work } from './migrations/work'
import type { Author } from './migrations/author'
import type { Edition } from './migrations/edition'

const uri = 'mongodb://localhost:27017'
const client = new MongoClient(uri, { ignoreUndefined: true })

console.log('Connecting to MongoDB...')
await client.connect()

const db = client.db('readarr')
const authors = db.collection<Author>('authors')
const editions = db.collection<Edition>('editions')
const works = db.collection<Work>('works')

export { client, db, authors, editions, works }

