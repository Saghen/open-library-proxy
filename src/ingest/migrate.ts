import { migrateWork, type WorkDump } from './migrations/work'
import { migrateAuthor, type AuthorDump } from './migrations/author'
import { migrateEdition, type EditionDump } from './migrations/edition'
import { migrateRating } from './migrations/ratings'
import type { Author, Edition, Work, Rating } from '../types'
import * as mongo from '../mongo'

let authorsToAdd: Author[] = []
let editionsToAdd: Edition[] = []
let worksToAdd: Work[] = []
let ratingsToAdd: Rating[] = []

async function process(line: string) {
  const [type, id, revision, date, json] = line.split('\t')
  const data = JSON.parse(json)

  switch (type) {
    case '/type/author':
      authorsToAdd.push(migrateAuthor(data as AuthorDump))
      if (authorsToAdd.length > 10000) {
        await mongo.authors.insertMany(authorsToAdd)
        authorsToAdd = []
      }
      break
    case '/type/edition':
      editionsToAdd.push(migrateEdition(data as EditionDump))
      if (editionsToAdd.length > 10000) {
        await mongo.editions.insertMany(editionsToAdd)
        editionsToAdd = []
      }
      break
    case '/type/work':
      worksToAdd.push(migrateWork(data as WorkDump))
      if (worksToAdd.length > 10000) {
        await mongo.works.insertMany(worksToAdd)
        worksToAdd = []
      }
      break
  }
}

async function flush() {
  await mongo.authors.insertMany(authorsToAdd)
  await mongo.editions.insertMany(editionsToAdd)
  await mongo.works.insertMany(worksToAdd)
  authorsToAdd = []
  editionsToAdd = []
  worksToAdd = []
}

async function processRatings(line: string) {
  ratingsToAdd.push(migrateRating(line))
  if (ratingsToAdd.length > 10000) {
    await mongo.ratings.insertMany(ratingsToAdd)
    ratingsToAdd = []
  }
}

async function flushRatings() {
  await mongo.ratings.insertMany(ratingsToAdd)
  ratingsToAdd = []

  // Add ratings to editions
  console.log('Adding ratings to editions...')
  await mongo.ratings
    .aggregate([
      // get all ratings
      { $match: { editionId: { $ne: null } } },
      // group by editionid, get the count and average rating
      { $group: { _id: '$editionId', ratingCount: { $count: {} }, averageRating: { $avg: '$rating' } } },
      // write to editions
      { $merge: { into: 'editions' } },
    ])
    .toArray()

  // Add ratings to works
  console.log('Adding ratings to works...')
  await mongo.ratings
    .aggregate([
      // get all ratings
      { $match: { workId: { $ne: null } } },
      // group by workId, get the count and average rating
      { $group: { _id: '$workId', ratingCount: { $count: {} }, averageRating: { $avg: '$rating' } } },
      // write to works
      { $merge: { into: 'works' } },
    ])
    .toArray()

  // Add ratings to authors
  console.log('Adding ratings to authors...')
  await mongo.works
    .aggregate([
      // get all works with ratings
      { $match: { ratingCount: { $gt: 0 }, authors: { $ne: [] } } },
      { $unwind: '$authors' },
      // group by authorId, get the count and average rating
      {
        $group: {
          _id: '$authors',
          ratingCount: { $sum: '$ratingCount' },
          averageRating: { $avg: '$averageRating' },
        },
      },
      // write to authors
      { $merge: { into: 'authors' } },
    ])
    .toArray()
}

export { process, flush, processRatings, flushRatings }
