import type { Work } from '../../types'
import type { AuthorLink, DateType, Link, TextBlock } from './types'
import { parseId } from './utils'

export type WorkDump = {
  type: { key: '/type/work' }
  key: string

  title: string
  subtitle?: string
  covers?: number[]
  authors?: AuthorLink[]
  /** Related URLs */
  links?: Link[]

  // TODO: what is this? exmaple: "RC489.L6 F69613 1997"
  lc_classifications?: string[]
  subjects?: string[]
  subject_places?: string[]
  subject_times?: string[]
  subject_people?: string[]

  description?: TextBlock
  notes?: TextBlock

  // year as a string. example: "1974"
  first_publish_date?: string
  revision: number
  latest_revision?: number
  created?: DateType
  last_modified: DateType

  /** @deprecated */
  id?: number
}

export function migrateWork(data: WorkDump): Work {
  return {
    _id: parseId(data.key),

    title: data.title,
    subtitle: data.subtitle,
    covers: data.covers?.map((id) => id.toString()),
    authors: data.authors
      ?.filter((_) => _.author?.key !== undefined)
      .map(({ author }) => parseId(author!.key)),
    links: data.links?.map(({ url, title }) => ({ url, title })),

    ratingCount: 0,

    lcClassifications: data.lc_classifications,
    subjects: data.subjects,
    subjectPlaces: data.subject_places,
    subjectTimes: data.subject_times,
    subjectPeople: data.subject_people,

    description: data.description?.value,
    notes: data.notes?.value,

    firstPublishYear: data.first_publish_date ? parseInt(data.first_publish_date) : undefined,

    createdAt: data.created ? new Date(data.created.value) : undefined,
    updatedAt: data.last_modified ? new Date(data.last_modified.value) : undefined,
  }
}
