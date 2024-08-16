import type { Id, DateType, TextBlock } from './types'
import { parseId } from './utils'

export type AuthorDump = {
  type: { key: '/type/author' }
  key: string

  entity_type?: 'person' | 'org' | 'event'

  name: string
  personal_name?: string
  fuller_name?: string
  alternate_names?: string[]
  title?: string

  bio?: TextBlock
  location?: string
  /** Incosistently formatted date, ignored for now */
  date?: string
  birth_date?: string
  death_date?: string

  /** IDs for the cover images */
  photos?: number[]

  remote_ids?: {
    wikidata?: string
    viaf?: string
  }

  revision: number
  latest_version?: number
  created?: DateType
  last_modified: DateType
}

export type Author = {
  _id: Id

  type?: 'person' | 'org' | 'event'

  name: string
  personalName?: string
  fullerName?: string
  alternateNames?: string[]
  title?: string

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

export function migrateAuthor(data: AuthorDump): Author {
  return {
    _id: parseId(data.key),

    type: data.entity_type,

    name: data.name,
    personalName: data.personal_name,
    fullerName: data.fuller_name,
    alternateNames: data.alternate_names,
    title: data.title,

    bio: data.bio?.value,
    location: data.location,
    birthDate: data.birth_date ? new Date(data.birth_date) : undefined,
    deathDate: data.death_date ? new Date(data.death_date) : undefined,

    photos: data.photos?.map((id) => id.toString()),

    links: data.remote_ids
      ? {
          wikidata: data.remote_ids?.wikidata,
          viaf: data.remote_ids?.viaf,
        }
      : undefined,

    createdAt: data.created ? new Date(data.created.value) : undefined,
    updatedAt: data.last_modified ? new Date(data.last_modified.value) : undefined,
  }
}
