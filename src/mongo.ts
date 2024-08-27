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
const state = db.collection<Status>('state')

const defaultState: Status = { ingestion: {} }
const deepMerge = (target: any, source: any) => Object.assign(target, source, { deepMerge: true })
const getStatus = (): Promise<Status> => state.findOne().then((state) => state ?? defaultState)
const setStatus = (state: Partial<Status>) =>
  getStatus().then((currentState) => deepMerge(currentState, state))

export { authors, editions, works, ratings, getStatus, setStatus }
