import type { Id, AuthorLink, DateType, Link, TextBlock } from './types'
import { type Pagination, parsePagination } from './pagination'
import { parseId } from './utils'

export type EditionDump = {
  type: { key: '/type/edition' }
  key: string

  title: string
  subtitle?: string
  description?: TextBlock
  first_sentence?: TextBlock
  notes?: TextBlock
  edition_name?: string

  series?: string[]
  // TODO: how can this be undefined?
  works?: { key: string }[]
  work_titles?: string[]

  authors?: AuthorLink[]
  /** Human-readable description of the author(s) */
  by_statement?: string

  publish_country?: string
  /** The publication date in Extended Date/Time Format (EDTF) -- https://www.loc.gov/standards/datetime/ */
  publish_date?: string
  publish_places?: string[]
  // TODO: create a separate collection for these?
  publishers?: string[]
  /** Names of people who contributed to the edition */
  contributions?: string[]

  genres?: string[]
  dewey_decimal_class?: string[]
  subjects?: string[]

  // TODO: type and parse this
  table_of_contents?: object[]
  pagination?: string
  number_of_pages?: number

  isbn_10?: string
  isbn_13?: string
  /** Library of Congress Control Numbers, linkable via https://lccn.loc.gov/<lccn> */
  lccn?: string
  /** Links to the Internet Archive record via https://archive.org/details/<ocaid> */
  ocaid?: string
  /** OCLC Online Computer Library Center / WorldCat id, linkable via https://www.worldcat.org/oclc/<oclc_number> */
  oclc_numbers?: string[]
  local_id?: string[]
  links?: Link[]

  covers?: (null | number)[]

  languages?: string[]
  /** Translated from original language(s) */
  translated_from?: string[]
  /** The title of the original work in its language. Example: "Ai margini del cao" */
  translation_of?: string

  /** Examples: "0.391", "300 grams", "0.3 kilos", "1 pounds" */
  weight?: string
  /** Examples: "5.4 x 4.7 x 0.2 inches", "21 x 14.8 x 0.8 centimeters" */
  physical_dimensions?: string
  /** Examples: "Paperback", "Hardcover", "Spiral-bound" */
  physical_format?: string

  /** Year: YYYY */
  copyright_date?: string

  revision: number
  latest_revision?: number
  created?: DateType
  last_modified: DateType
}

export type Edition = {
  _id: Id

  title: string
  subtitle?: string
  description?: string
  firstSentence?: string
  notes?: string
  editionName?: string

  series?: string[]
  works: Id[]
  workTitles?: string[]

  authors?: Id[]
  humanReadableAuthors?: string

  publishCountry?: string
  publishDate?: Date
  publishPlaces?: string[]
  publishers?: string[]
  contributions?: string[]

  genres?: string[]
  deweyDecimalClass?: string[]
  subjects?: string[]

  pagination?: Pagination
  numberOfPages?: number

  ids: {
    isbn10?: string
    isbn13?: string
    lccn?: string
    ocaid?: string
    oclcNumbers?: string[]
    localId?: string[]
  }
  relatedLinks?: { url: string; title: string }[]

  covers?: Id[]

  languages?: string[]
  translatedFrom?: string[]
  translationOf?: string

  weight?: string
  physicalDimensions?: string
  physicalFormat?: string

  copyrightYear?: number

  createdAt?: Date
  updatedAt?: Date
}

export function migrateEdition(data: EditionDump): Edition {
  // TOOD: how is this possible and how often is this the case?
  return {
    _id: parseId(data.key),

    title: data.title,
    subtitle: data.subtitle,
    description: data.description?.value,
    firstSentence: data.first_sentence?.value,
    notes: data.notes?.value,
    editionName: data.edition_name,

    series: data.series,
    works: (data.works ?? []).map(({ key }) => parseId(key)),
    workTitles: data.work_titles,

    authors: data.authors
      ?.filter((_) => _.author?.key !== undefined)
      .map(({ author }) => parseId(author!.key)),
    humanReadableAuthors: data.by_statement,

    publishCountry: data.publish_country,
    publishDate: data.publish_date ? new Date(data.publish_date) : undefined,
    publishPlaces: data.publish_places,
    publishers: data.publishers,
    contributions: data.contributions,

    genres: data.genres,
    deweyDecimalClass: data.dewey_decimal_class,
    subjects: data.subjects,

    pagination: data.pagination ? parsePagination(data.pagination) : undefined,
    numberOfPages: data.number_of_pages,

    ids: {
      isbn10: data.isbn_10,
      isbn13: data.isbn_13,
      lccn: data.lccn,
      ocaid: data.ocaid,
      oclcNumbers: data.oclc_numbers,
      localId: data.local_id,
    },
    relatedLinks: data.links,

    covers: data.covers?.filter((cover) => cover !== null).map((id) => id.toString()),

    languages: data.languages,
    translatedFrom: data.translated_from,
    translationOf: data.translation_of,

    weight: data.weight,
    physicalDimensions: data.physical_dimensions,
    physicalFormat: data.physical_format,

    copyrightYear: data.copyright_date ? parseInt(data.copyright_date) : undefined,

    createdAt: data.created ? new Date(data.created.value) : undefined,
    updatedAt: data.last_modified ? new Date(data.last_modified.value) : undefined,
  }
}
