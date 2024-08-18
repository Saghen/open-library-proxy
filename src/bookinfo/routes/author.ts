import { NotFound, BadRequest } from 'fejl'
import { authors, editions, works } from '../../db'
import { foreignIdToId, idToForeignId, stringToForeignId } from '../helpers'
import type { BIAuthor, BIBook, BISeries, BISeriesLinkItem } from '../types'

export default async function author(id: string): Promise<Response> {
  BadRequest.assert(!isNaN(parseInt(id)), 'ID must be a number')

  const author = await authors.findOne({ _id: foreignIdToId(id, 'author') })
  NotFound.assert(author, 'Author not found')

  console.time('Finding works')
  const authorWorks = await works.find({ authors: { $in: [foreignIdToId(id, 'author')] } }).toArray()
  console.timeEnd('Finding works')

  console.time('Finding editions')
  const authorEditions = await editions
    .find({ works: { $in: authorWorks.map((work) => work._id) } })
    .toArray()
    .then((editions) =>
      editions.map((edition) => ({
        ...edition,
        series: edition.series?.map((series) => {
          const match = series.match(/(.*?)[,\s]*(\d+)$/)!
          return { name: match[1], position: Number(match[2]) }
        }),
      })),
    )
  console.timeEnd('Finding editions')

  const series = authorEditions.flatMap((edition) => edition.series ?? [])

  const biAuthor: BIAuthor = {
    ForeignId: Number(id),
    Name: author.name,
    TitleSlug: `${id}-${author.name.replaceAll(' ', '_')}`,
    Description: author.bio ?? '',
    // TODO: convert to url
    ImageUrl: author.photos?.[0] ?? '',
    // TODO: check this
    Url: `https://openlibrary.org/authors/${foreignIdToId(id, 'author')}`,
    ReviewCount: 0, // TODO:
    RatingCount: 0, // TODO:
    AverageRating: 0, // TODO:
    Works: authorWorks.map((work) => {
      const editions = authorEditions.filter((edition) => edition.works?.includes(work._id))
      const workTitleSlug = `${idToForeignId(work._id)}-${work.title.replaceAll(' ', '_')}`
      return {
        ForeignId: idToForeignId(work._id),
        Title: work.title,
        TitleSlug: workTitleSlug,
        ReleaseDate: work.createdAt?.toString() ?? '',
        Url: `https://openlibrary.org/works/${work._id}`,
        Genres: editions.flatMap((edition) => edition.genres).filter((genre) => genre !== undefined),
        RelatedWorks: [],
        Books: editions.map<BIBook>((edition) => ({
          ForeignId: idToForeignId(edition._id),
          ForeignWorkId: idToForeignId(work._id),
          Title: edition.title,
          TitleSlug: `${idToForeignId(edition._id)}-${edition.title.replaceAll(' ', '_')}`,
          OriginalTitle: '',
          WorkTitleSlug: workTitleSlug,
          Description: edition.description ?? '',

          CountryCode: edition.publishCountry ?? '',
          Language: edition.languages?.[0] ?? '', // 3 letter code
          Format: edition.physicalFormat ?? '', // Hardcover, Paperback, etc
          EditionInformation: '',
          Publisher: edition.publishers?.[0] ?? '',

          IsEbook: true, // TODO:
          NumPages: edition.numberOfPages ?? 0,
          ReviewCount: 0, // TODO:
          RatingCount: 0, // TODO:
          AverageRating: 5, // TODO:

          ImageUrl: edition.covers?.[0] ?? '', // TODO: convert to url
          Url: `https://openlibrary.org/works/${work._id}`,

          ReleaseDate: edition.publishDate?.toString() ?? edition.createdAt?.toString() ?? '', // YYYY-MM-DDTHH:MM:SSZ (ISO 8601)
          // TODO:
          OriginalReleaseDate: edition.publishDate?.toString() ?? edition.createdAt?.toString() ?? '',

          Contributors:
            work.authors?.map((author) => ({
              ForeignId: idToForeignId(author),
              Role: 'Author',
            })) ?? [],
        })),
      }
    }),
    Series: series.map<BISeries>((series) => ({
      ForeignId: stringToForeignId(series.name),
      Name: series.name,
      Title: series.name,
      Description: '',
      // TODO: this url is wrong
      Url: `https://openlibrary.org/works?series=${series}`,
      LinkItems: authorWorks
        .map((work) => ({
          work,
          editions: authorEditions.filter((edition) => edition.works?.includes(work._id)),
        }))
        // Get only works/editions that belong to this series
        .filter(({ editions }) =>
          editions.some((edition) =>
            edition.series?.some((editionSeries) => editionSeries.name === series.name),
          ),
        )
        .map<BISeriesLinkItem>(({ work, editions }) => ({
          ForeignSeriesId: stringToForeignId(series.name),
          ForeignWorkId: idToForeignId(work._id),
          Title: work.title,
          Url: `https://openlibrary.org/works/${work._id}`,
          // HACK: lol
          PositionInSeries: String(
            editions
              .find((edition) => edition.series?.some((editionSeries) => editionSeries.name === series.name))
              ?.series?.find((editionSeries) => editionSeries.name === series.name)?.position,
          ),
          Primary: true, // TODO: why is this always true?
          SeriesPosition: 0, // TODO: why is this always 0?
        }))
        .sort((a, b) => Number(a.PositionInSeries) - Number(b.PositionInSeries)),
    })),
  }

  return new Response(JSON.stringify(biAuthor))
}
