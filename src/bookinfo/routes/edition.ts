import { NotFound, BadRequest } from 'fejl'
import { editions } from '../../db'
import { foreignIdToId, idToForeignId } from '../helpers'
import work from './work'

export default async function edition(id: string): Promise<Response> {
  BadRequest.assert(!isNaN(parseInt(id)), 'ID must be a number')

  const edition = await editions.findOne({ _id: foreignIdToId(id, 'edition') })
  NotFound.assert(edition, 'Edition not found')
  NotFound.assert((edition.works?.length ?? 0) > 0, 'Edition has no works')

  // The work typically doesnt contain the author, so we get the author from the work
  // TODO: check if it has an author first and then fallback to this?
  const primaryWork = edition.works![0]
  return work(idToForeignId(primaryWork).toString())
}
