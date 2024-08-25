import * as meili from '../../meili'
import * as mongo from '../../mongo'
import type { Author, Edition, Work } from '../../types'
import { idToForeignId } from '../helpers'

type GoodReadsSearchWork = {
  /** Query ID */
  qid: string
  /** Stringified Foreign ID */
  workId: string
  /** Stringified Foreign ID */
  bookId: string
  bookUrl: string
  kcrPreviewUrl: string | null

  title: string
  bookTitleBare: string
  description: {
    html: string
    truncated: boolean
    fullContentUrl: string
  }
  numPages: number
  avgRating: string
  ratingsCount: number
  imageUrl: string

  author: GoodReadsSearchAuthor

  from_search: true
  from_srp: true

  /** Index of result in the search results */
  rank: number
}

type GoodReadsSearchAuthor = {
  id: number
  name: string
  isGoodreadsAuthor: true
  profileUrl: string
  worksListUrl: string
}

export default async function bookInfoSearch(query: string): Promise<Response> {
  const queryId = (Math.random() + 1).toString(16).slice(2, 12)
  const searchWorkIds = await meili.works
    .search(query, { limit: 5 })
    .then((search) => search.hits.map((hit) => hit.id))

  // prettier-ignore
  const works = await mongo.works
    .aggregate<Omit<Work, 'authors'> & { authors: Author[], editions: Edition[] }>([
      { $match: { _id: { $in: searchWorkIds }, authors: { $ne: [] } } },
      { $lookup: { from: 'authors', localField: 'authors', foreignField: '_id', as: 'authors' } },
      { $lookup: { from: 'editions', localField: '_id', foreignField: 'works', as: 'editions' } },
    ])
    .toArray()
    .then(works =>
      works
        .filter((work => work.editions.length > 0))
        .sort((a, b) => searchWorkIds.indexOf(a._id) - searchWorkIds.indexOf(b._id))
    )

  const results: GoodReadsSearchWork[] = works
    .filter((work) => work.authors.length > 0)
    .map((work, i) => ({
      qid: queryId,
      workId: String(idToForeignId(work._id)),
      bookId: String(idToForeignId(work.editions[0]._id)),
      bookUrl: `https://openlibrary.org/books/${work.editions[0]._id}`,
      kcrPreviewUrl: null,

      // TODO: add subtitle to this?
      title: work.title,
      bookTitleBare: work.title,
      description: {
        html: work.description ?? '',
        truncated: false,
        fullContentUrl: `https://openlibrary.org/works/${work._id}`,
      },
      numPages: Math.max(...work.editions.map((edition) => edition.numberOfPages ?? 0)),
      avgRating: (work.averageRating ?? 0).toString(),
      ratingsCount: work.ratingCount ?? 0, // todo: this should never be undefined, need resync?
      imageUrl: work.covers?.[0] ?? '',

      author: {
        id: idToForeignId(work.authors[0]._id),
        name: work.authors[0].name,
        isGoodreadsAuthor: true,
        profileUrl: `https://openlibrary.org/authors/${work.authors[0]._id}`,
        worksListUrl: `https://openlibrary.org/authors/${work.authors[0]._id}`,
      },

      from_search: true,
      from_srp: true,

      rank: i + 1,
    }))

  return new Response(JSON.stringify(results))
}
