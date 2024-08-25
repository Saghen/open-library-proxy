export type BIAuthor = {
  ForeignId: number
  Name: string
  TitleSlug: string
  Description: string
  ImageUrl: string
  Url: string // Goodreads URL
  ReviewCount: number
  RatingCount: number
  AverageRating: number
  Works: BIWork[]
  Series: BISeries[]
}

export type BIWork = {
  ForeignId: number
  Title: string
  TitleSlug: string
  ReleaseDate: string // YYYY-MM-DDTHH:MM:SSZ (ISO 8601)
  Url: string // Goodreads URL
  Genres: string[]
  RelatedWorks: number[] // Foreign IDs
  Books: BIBook[]
}

export type BIBook = {
  ForeignId: number
  ForeignWorkId: number
  Title: string
  TitleSlug: string
  OriginalTitle: string
  WorkTitleSlug: string
  Description: string

  CountryCode: string
  Language: string // 3 letter code
  Format: string // Hardcover, Paperback, etc
  EditionInformation: string
  Publisher: string

  IsEbook: boolean
  NumPages: number
  ReviewCount: number
  RatingCount: number
  AverageRating: number

  ImageUrl: string
  Url: string // Goodreads URL

  ReleaseDate: string // YYYY-MM-DDTHH:MM:SSZ (ISO 8601)
  OriginalReleaseDate: string // YYYY-MM-DDTHH:MM:SSZ (ISO 8601)

  Contributors: {
    ForeignId: number
    Role: string // i.e. Author
  }[]
}

export type BISeries = {
  ForeignId: number
  Title: string
  Description: string

  LinkItems: BISeriesLinkItem[]
}

export type BISeriesLinkItem = {
  Primary: boolean // TODO: what is this?
  // TODO: can this be null?
  PositionInSeries: string | null // number as string starting from 1
  SeriesPosition: number // TODO: always 0?
  ForeignSeriesId: number
  ForeignWorkId: number
}
