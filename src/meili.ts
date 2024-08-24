import { MeiliSearch } from 'meilisearch'
import type { MeiliWork } from './types'

console.log('Connecting to MeiliSearch...')
const client = new MeiliSearch({ host: 'localhost:7700' })
while (!(await client.isHealthy())) {
  await new Promise((resolve) => setTimeout(resolve, 1000))
}
console.log('Connected to MeiliSearch')

const works = client.index<MeiliWork>('works')

export { client, works }
