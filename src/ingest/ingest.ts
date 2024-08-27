import * as mongo from '../mongo'
import download from './download'
import ingestMeili from './meili'
import ingestMongo from './mongo'
import c from 'ansi-colors'

export default async function ingest(forceReingest: boolean = false) {
  const { completedAt, mongoCompletedAt, meiliCompletedAt } = await mongo
    .getStatus()
    .then((status) => status.ingestion)

  // Skip ingest if already completed
  if (!forceReingest && completedAt !== undefined) {
    console.log(`Skipping ingest, already completed at ${completedAt.toISOString()}`)
    return
  }

  console.log(c.bold('Starting ingest...'))
  if (forceReingest) console.warn('Force reingest is enabled')

  await download()

  // MongoDB
  if (!forceReingest && mongoCompletedAt !== undefined) {
    console.log(`Skipping mongo ingest, already completed at ${mongoCompletedAt.toISOString()}`)
  } else {
    console.log(c.bold('Ingesting into MongoDB'))
    await ingestMongo()
    await mongo.setStatus({ ingestion: { mongoCompletedAt: new Date() } })
  }

  // MeiliSearch
  if (!forceReingest && meiliCompletedAt !== undefined) {
    console.log(`Skipping MeiliSearch ingest, already completed at ${meiliCompletedAt.toISOString()}`)
  } else {
    console.log(c.bold('Ingesting into MeiliSearch'))
    await ingestMeili()
    await mongo.setStatus({ ingestion: { meiliCompletedAt: new Date() } })
  }

  // TODO: clear downloads (configurable)

  await mongo.setStatus({ ingestion: { completedAt: new Date() } })
  console.log(c.bold('Ingestion complete!'))
}
