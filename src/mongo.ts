import { MongoClient } from 'mongodb'
import type { Author, Edition, Rating, Work } from './types'

console.log('Connecting to MongoDB...')
const uri = 'mongodb://localhost:27017'
const client = new MongoClient(uri, { ignoreUndefined: true })
await client.connect()
console.log('Connected to MongoDB')

const db = client.db('readarr')
const authors = db.collection<Author>('authors')
const editions = db.collection<Edition>('editions')
const works = db.collection<Work>('works')
const ratings = db.collection<Rating>('ratings')

export { authors, editions, works, ratings }
