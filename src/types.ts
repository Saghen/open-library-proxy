export type Id = string

export type Author = {
  _id: Id

  type?: 'person' | 'org' | 'event'

  name: string
  personalName?: string
  fullerName?: string
  alternateNames?: string[]
  title?: string

  ratingCount: number
  averageRating?: number

  bio?: string
  location?: string
  birthDate?: Date
  deathDate?: Date

  /** IDs for the cover images */
  photos?: Id[]

  links?: {
    wikidata?: string
    viaf?: string
  }

  createdAt?: Date
  updatedAt?: Date
}

export type Edition = {
  _id: Id

  title: string
  subtitle?: string
  description?: string
  firstSentence?: string
  notes?: string
  editionName?: string

  series?: { name: string; position?: number }[]
  works: Id[]
  workTitles?: string[]

  ratingCount: number
  averageRating?: number

  // TODO: safe to ignore? this should be in the work
  authors?: Id[]
  // TODO: convert to authors
  humanReadableAuthors?: string

  publishCountry?: string
  publishDate?: Date
  publishPlaces?: string[]
  publishers?: string[]
  contributions?: string[]

  // TODO: convert to subjects
  genres?: string[]
  deweyDecimalClass?: string[]
  subjects?: string[]

  pagination?: string
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

  titleNativeLanguage?: string
  languages?: string[]
  translatedFrom?: string[]

  weight?: string
  physicalDimensions?: string
  // TODO: can this be an enum?
  physicalFormat?: string

  copyrightYear?: number

  createdAt?: Date
  updatedAt?: Date
}

export type Rating = {
  workId: string
  editionId?: string
  rating: number
  date: Date
}

export type Work = {
  _id: Id

  title: string
  subtitle?: string
  covers?: Id[]
  authors?: Id[]
  /** Related URLs */
  links?: { url: string; title: string }[]

  ratingCount: number
  averageRating?: number

  // TODO: what is this? exmaple: "RC489.L6 F69613 1997"
  lcClassifications?: string[]
  subjects?: string[]
  subjectPlaces?: string[]
  subjectTimes?: string[]
  subjectPeople?: string[]

  description?: string
  notes?: string

  firstPublishYear?: number

  createdAt?: Date
  updatedAt?: Date
}

export type MeiliWork = {
  id: string
  title: string
  subtitle: string
  subjects: string[]
  series: string[]
  authors: string[]
  editionCount: number
  ratingCount: number
  authorRatingCount: number
}
