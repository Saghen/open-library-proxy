import { MongoClient } from 'mongodb'
import type { Author, Edition, Rating, Status, Work } from './types'
import { config } from './config'

console.log('Connecting to MongoDB...')
const client = new MongoClient(config.mongo.connectionString, { ignoreUndefined: true })
await client.connect()
console.log('Connected to MongoDB')

const db = client.db()
const authors = db.collection<Author>('authors')
const editions = db.collection<Edition>('editions')
const works = db.collection<Work>('works')
const ratings = db.collection<Rating>('ratings')

export { authors, editions, works, ratings }
