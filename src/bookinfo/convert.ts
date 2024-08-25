import { parseId } from '../ingest/migrations/utils'
import type { Author, Edition, Work } from '../types'
import { coverIdToUrl } from '../utils'
import { idToForeignId, stringToForeignId } from './helpers'
import type { BIAuthor, BIBook, BISeries, BISeriesLinkItem } from './types'

export function convertAuthor(author: Author, authorWorks: Work[], authorEditions: Edition[]): BIAuthor {
  // TODO: merge names that are extremely similar
  // TODO: resolves conflicts by choosing the one with the most works/reviews
  const series = authorEditions
    .flatMap((edition) => edition.series ?? [])
    .filter((series, i, allSeries) =>
      allSeries.slice(0, i).every((otherSeries) => otherSeries.name !== series.name),
    )

  // TODO: filter during ingestion
  authorWorks = authorWorks.filter((work) => work.title !== undefined)
  // TODO: something wrong with createdAt/publishDate causing it to be at year 0000
  authorEditions = authorEditions.filter(
    (edition) =>
      (!edition.createdAt || edition.createdAt > new Date('0001-01-01')) &&
      (!edition.publishDate || edition.publishDate > new Date('0001-01-01')),
  )

  // TODO: temporary
  for (const edition of authorEditions) {
    edition.languages = edition.languages?.map((lang) =>
      typeof lang !== 'string' ? parseId(lang.key) : lang,
    )
  }

  return {
    ForeignId: Number(idToForeignId(author._id)),
    Name: author.name,
    TitleSlug: `${idToForeignId(author._id)}-${author.name.replaceAll(' ', '_')}`,
    Description: author.bio ?? '',
    ImageUrl: (author.photos?.[0] && coverIdToUrl(author.photos[0], 'author')) ?? '',
    Url: `https://openlibrary.org/authors/${author._id}`,
    ReviewCount: 0, // TODO:
    RatingCount: author.ratingCount,
    AverageRating: author.averageRating ?? 0,

    Works: authorWorks
      .map((work) => {
        const editions = authorEditions.filter((edition) => edition.works?.includes(work._id))
        const workTitleSlug = `${idToForeignId(work._id)}-${work.title.replaceAll(' ', '_')}`
        return {
          ForeignId: idToForeignId(work._id),
          Title: work.title,
          TitleSlug: workTitleSlug,
          ReleaseDate: work.createdAt?.toISOString() ?? '',
          Url: `https://openlibrary.org/works/${work._id}`,
          Genres: editions
            .flatMap((edition) => edition.genres ?? [])
            .filter((genre, i, genres) => genres.indexOf(genre) === i),
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
            Format: 'paperback' ?? '', // Hardcover, Paperback, etc
            EditionInformation: '',
            Publisher: edition.publishers?.[0] ?? '',

            IsEbook: true, // TODO:
            NumPages: edition.numberOfPages ?? 0,
            ReviewCount: 0, // TODO:
            RatingCount: edition.ratingCount,
            AverageRating: edition.averageRating ?? 0,

            ImageUrl: (edition.covers?.[0] && coverIdToUrl(edition.covers[0], 'book')) ?? '',
            Url: `https://openlibrary.org/books/${work._id}`,

            ReleaseDate: edition.publishDate?.toISOString() ?? edition.createdAt?.toISOString() ?? '',
            // TODO:
            OriginalReleaseDate: edition.publishDate?.toISOString() ?? edition.createdAt?.toISOString() ?? '',

            // HACK: Readarr expects that the author is the first item in this list
            // Contributors: [
            //   author._id,
            //   ...(work.authors?.filter((authorId) => authorId !== author._id) ?? []),
            // ].map((authorId) => ({
            //   ForeignId: idToForeignId(authorId),
            //   Role: 'Author',
            // })),

            Contributors:
              work.authors?.map((authorId) => ({
                ForeignId: idToForeignId(authorId),
                Role: 'Author',
              })) ?? [],
          })),
        }
      })
      .filter(({ Books }) => Books.length > 0),

    Series: series.map<BISeries>((series) => ({
      ForeignId: stringToForeignId(series.name),
      Name: series.name,
      Title: series.name,
      Description: '',
      Url: '', // TODO: openlibrary doesnt have a page for series
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
          // TODO: dont default to 1?
          PositionInSeries: String(
            editions
              .find((edition) => edition.series?.some((editionSeries) => editionSeries.name === series.name))
              ?.series?.find((editionSeries) => editionSeries.name === series.name)?.position ?? 1,
          ),
          Primary: true, // TODO: why is this always true?
          SeriesPosition: 0, // TODO: why is this always 0?
        }))
        .sort((a, b) => Number(a.PositionInSeries) - Number(b.PositionInSeries)),
    })),
  }
}
