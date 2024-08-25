import { parseId } from '../ingest/migrations/utils'
import type { Author, Edition, Work } from '../types'
import { coverIdToUrl } from '../utils'
import { idToForeignId, stringToForeignId } from './helpers'
import type { BIAuthor, BIBook, BISeries, BISeriesLinkItem } from './types'

export function convertAuthor(author: Author, authorWorks: Work[], authorEditions: Edition[]): BIAuthor {
  // TODO: filter during ingestion
  authorWorks = authorWorks.filter((work) => work.title !== undefined)
  // TODO: something wrong with createdAt/publishDate causing it to be at year 0000
  authorEditions = authorEditions.filter(
    (edition) =>
      (!edition.createdAt || edition.createdAt > new Date('0001-01-01')) &&
      (!edition.publishDate || edition.publishDate > new Date('0001-01-01')),
  )

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

    Series: extractSeriesList(authorEditions),
  }
}

function extractSeriesList(editions: Edition[]): BISeries[] {
  // TODO: merge names that are extremely similar
  // TODO: only include series with ratingCounts that make sense for the author
  const seriesNames = editions
    .flatMap((edition) => edition.series ?? [])
    .filter((series, i, allSeries) =>
      allSeries.slice(0, i).every((otherSeries) => otherSeries.name !== series.name),
    )
    .map((series) => series.name)

  const series: BISeries[] = []
  for (const seriesName of seriesNames) {
    const seriesEditions = editions.filter((edition) =>
      edition.series?.some((editionSeries) => editionSeries.name === seriesName),
    )

    const editionsWithPosition: Record<number, Edition> = {}
    for (const edition of seriesEditions) {
      const relevantSeries = edition.series!.find((editionSeries) => editionSeries.name === seriesName)!
      // TODO: don't ingore when position is missing
      if (!relevantSeries.position) continue

      const existingEdition = editionsWithPosition[relevantSeries.position]
      // Only replace if the new edition has a higher rating count
      // TODO: only include editions that have a ratingCount similar to the others
      if (!existingEdition || existingEdition.ratingCount < edition.ratingCount) {
        editionsWithPosition[relevantSeries.position] = edition
      }
    }

    series.push({
      ForeignId: stringToForeignId(seriesName),
      Title: seriesName,
      Description: '',
      LinkItems: Object.entries(editionsWithPosition).map(([position, edition]) =>
        editionToSeriesLinkItem(edition, { name: seriesName, position: Number(position) }),
      ),
    })
  }

  return series
}

function editionToSeriesLinkItem(
  edition: Edition,
  series: { name: string; position?: number },
): BISeriesLinkItem {
  return {
    ForeignSeriesId: stringToForeignId(series.name),
    ForeignWorkId: idToForeignId(edition._id),
    Title: edition.title,
    PositionInSeries: series.position !== undefined ? String(series.position) : null,
    Primary: true, // TODO: why is this always true?
    SeriesPosition: 0, // TODO: why is this always 0?
  }
}
