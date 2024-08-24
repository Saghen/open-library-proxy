import * as mongo from '../mongo'
import download from './download'
import ingestMeili from './meili'
import ingestMongo from './mongo'
import c from 'ansi-colors'

export default async function ingest(forceRebuild: boolean = false) {
  if (!forceRebuild && (await mongo.authors.estimatedDocumentCount()) > 0) {
    console.log('Skipping OpenLibrary ingest, database is not empty')
    return
  }
  console.log(c.bold('Starting OpenLibrary ingest...'))
  if (forceRebuild) console.warn('Force rebuild is enabled')

  await download()

  console.log(c.bold('Ingesting into MongoDB'))
  await ingestMongo()

  // Ingest data to MeiliSearch
  console.log(c.bold('Ingesting into MeiliSearch'))
  await ingestMeili()

  console.log(c.bold('Ingestion complete!'))
}
