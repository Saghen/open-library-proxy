import { authors, client, editions, works } from './client'

console.log('Creating indices...')

console.log('Creating indices for authors...')
await authors.createIndex({ name: 'text' })
await authors.createIndex({ personalName: 'text' })
await authors.createIndex({ type: 1 })

console.log('Creating indices for editions...')
await editions.createIndex({ title: 'text' })
await editions.createIndex({ editionName: 'text' })
await editions.createIndex({ publishDate: 1 })
await editions.createIndex({ publishPlaces: 1 })
await editions.createIndex({ publishers: 1 })
await editions.createIndex({ contributions: 1 })
await editions.createIndex({ subjects: 1 })

console.log('Creating indices for works...')
await works.createIndex({ title: 'text' })
await works.createIndex({ subjects: 1 })

await client.close()
