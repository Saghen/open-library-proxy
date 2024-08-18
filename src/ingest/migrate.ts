import { migrateWork, type WorkDump, type Work } from './migrations/work'
import { migrateAuthor, type Author, type AuthorDump } from './migrations/author'
import { migrateEdition, type Edition, type EditionDump } from './migrations/edition'
import { authors, editions, works } from '../db'

let authorsToAdd: Author[] = []
let editionsToAdd: Edition[] = []
let worksToAdd: Work[] = []

async function process(line: string) {
  const [type, id, revision, date, json] = line.split('\t')
  const data = JSON.parse(json)

  switch (type) {
    case '/type/author':
      authorsToAdd.push(migrateAuthor(data as AuthorDump))
      if (authorsToAdd.length > 10000) {
        await authors.insertMany(authorsToAdd)
        authorsToAdd = []
      }
      break
    case '/type/edition':
      editionsToAdd.push(migrateEdition(data as EditionDump))
      if (editionsToAdd.length > 10000) {
        await editions.insertMany(editionsToAdd)
        editionsToAdd = []
      }
      break
    case '/type/work':
      worksToAdd.push(migrateWork(data as WorkDump))
      if (worksToAdd.length > 10000) {
        await works.insertMany(worksToAdd)
        worksToAdd = []
      }
      break
  }
}

async function flush() {
  await authors.insertMany(authorsToAdd)
  await editions.insertMany(editionsToAdd)
  await works.insertMany(worksToAdd)
  authorsToAdd = []
  editionsToAdd = []
  worksToAdd = []
}

export { process, flush }
