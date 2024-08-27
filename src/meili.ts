import { MeiliSearch } from 'meilisearch'
import type { MeiliWork } from './types'
import { config } from './config'

console.log('Connecting to MeiliSearch...')
const client = new MeiliSearch(config.meili)
while (!(await client.isHealthy())) {
  await new Promise((resolve) => setTimeout(resolve, 1000))
}
console.log('Connected to MeiliSearch')

const works = client.index<MeiliWork>('works')

export { client, works }
