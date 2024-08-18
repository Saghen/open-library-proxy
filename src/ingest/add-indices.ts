import { authors, editions, works } from '../db'

export default async function addIndices() {
  console.log('Creating indices...')

  console.log('Creating indices for authors...')
  await authors.createIndex({ name: 'text' })

  console.log('Creating indices for editions...')
  await editions.createIndex({ works: 1 })

  console.log('Creating indices for works...')
  await works.createIndex({ title: 'text', subtitle: 'text' })
  await works.createIndex({ subjects: 1 })
  await works.createIndex({ authors: 1 })

  console.log('Indices created!')
}
