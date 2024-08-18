import { NotFound, BadRequest } from 'fejl'
import { works } from '../../db'
import { foreignIdToId, idToForeignId } from '../helpers'

export default async function work(id: string): Promise<Response> {
  BadRequest.assert(!isNaN(parseInt(id)), 'ID must be a number')

  const work = await works.findOne({ _id: foreignIdToId(id, 'work') })
  NotFound.assert(work, 'Work not found')
  NotFound.assert((work.authors?.length ?? 0) > 0, 'Work has no authors')

  // Redirect to the author
  const primaryAuthor = work.authors![0]
  return new Response(null, {
    status: 302,
    headers: { Location: `/bookinfo/v1/author/${idToForeignId(primaryAuthor)}` },
  })
}
