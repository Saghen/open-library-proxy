export type Id = string

export type DateType = {
  type: '/type/datetime'
  value: string
}

export type TextBlock = {
  type: '/type/text'
  value: string
}

export type Link = {
  type: { key: '/type/link' }
  url: string
  title: string
}

export type AuthorLink = {
  type: '/type/author_role'
  // TODO: why do some not include this?
  author?: {
    /** The ID of the author */
    key: string
  }
}
