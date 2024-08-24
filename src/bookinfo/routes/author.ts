import { NotFound, BadRequest } from 'fejl'
import * as mongo from '../../mongo'
import { foreignIdToId, idToForeignId, stringToForeignId } from '../helpers'
import type { BIAuthor, BIBook, BISeries, BISeriesLinkItem } from '../types'
import { coverIdToUrl } from '../../utils'
import { convertAuthor } from '../convert'

export default async function author(id: string): Promise<Response> {
  BadRequest.assert(!isNaN(parseInt(id)), 'ID must be a number')

  const author = await mongo.authors.findOne({ _id: foreignIdToId(id, 'author') })
  NotFound.assert(author, 'Author not found')

  const authorWorks = await mongo.works.find({ authors: { $in: [foreignIdToId(id, 'author')] } }).toArray()
  const authorEditions = await mongo.editions
    .find({ works: { $in: authorWorks.map((work) => work._id) } })
    .toArray()

  return new Response(JSON.stringify(convertAuthor(author, authorWorks, authorEditions)), {
    headers: { 'Content-Type': 'application/json' },
  })
}
