import * as mongo from '../../mongo'
import { convertAuthor } from '../convert'
import { foreignIdToId } from '../helpers'
import type { BIAuthor } from '../types'

const uniqueByProperty = <T>(array: T[], property: keyof T) =>
  array.filter(
    (item, index, items) => items.slice(0, index).find((i) => i[property] === item[property]) === undefined,
  )

export default async function bulk(ids: string[]) {
  // We receive the edition IDs so we go from editions -> works -> authors
  // and then grab all the works/editions for each author

  const editions = await mongo.editions
    .find({ _id: { $in: ids.map((id) => foreignIdToId(id, 'edition')) } })
    .toArray()
  const works = await mongo.works
    .find({ _id: { $in: editions.flatMap((edition) => edition.works) } })
    .toArray()
  const authors = await mongo.authors
    .find({ _id: { $in: works.flatMap((work) => work.authors?.[0] ?? []) } })
    .toArray()

  const biAuthors: BIAuthor[] = []
  for (const author of authors) {
    const authorWorks = works.filter((work) => work.authors?.includes(author._id))
    const workIds = authorWorks.map((work) => work._id)
    const authorEditions = editions.filter((edition) =>
      workIds.some((workId) => edition.works.includes(workId)),
    )
    biAuthors.push(convertAuthor(author, authorWorks, authorEditions))
  }

  const uniqueAuthors = uniqueByProperty(biAuthors, 'ForeignId')
  const uniqueSeries = uniqueByProperty(
    biAuthors.flatMap((author) => author.Series),
    'ForeignId',
  )
  const uniqueWorks = uniqueByProperty(
    biAuthors.flatMap((author) => author.Works),
    'ForeignId',
  )

  return new Response(
    JSON.stringify({
      Works: uniqueWorks,
      Authors: uniqueAuthors.map(({ Works, Series, ...Author }) => Author),
      Series: [],
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
}
