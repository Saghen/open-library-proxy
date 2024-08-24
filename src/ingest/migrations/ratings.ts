import type { Rating } from '../../types'
import { parseId } from './utils'

export function migrateRating(line: string): Rating {
  const [workId, editionId, rating, date] = line.split('\t')
  return {
    workId: parseId(workId),
    editionId: editionId !== '' ? parseId(editionId) : undefined,
    rating: Number(rating),
    date: new Date(date),
  }
}
