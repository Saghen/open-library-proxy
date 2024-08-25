import ProgressBar from 'progress'
import * as mongo from '../mongo'
import * as meili from '../meili'
import type { Author, Edition, MeiliWork, Work } from '../types'

type AggregateWork = Omit<Work, 'authors'> & { authors: Author[]; editions: Edition[] }

export default async function ingestMeili() {
  console.log('Clearing...')
  const deleteTask = await meili.works.delete()
  await meili.works.waitForTasks([deleteTask.taskUid])

  console.log('Ingesting works...')
  const progress = new ProgressBar(':bar :rate/dps :percent :etas', {
    complete: '=',
    incomplete: '-',
    total: await mongo.works.estimatedDocumentCount(),
  })

  const worksWithAuthors = mongo.works.aggregate<AggregateWork>(
    [
      { $match: {} },
      { $lookup: { from: 'authors', localField: 'authors', foreignField: '_id', as: 'authors' } },
      { $lookup: { from: 'editions', localField: '_id', foreignField: 'works', as: 'editions' } },
    ],
    { batchSize: 10_000 },
  )

  let worksToAdd: MeiliWork[] = []
  for await (const work of worksWithAuthors) {
    worksToAdd.push({
      id: work._id,
      title: work.title,
      subtitle: work.subtitle ?? '',
      authors: work.authors?.map((author) => author.name),
      subjects: work.subjects ?? [],
      series: Array.from(
        new Set(work.editions.flatMap((edition) => edition.series ?? []).map((series) => series.name)),
      ),
      editionCount: work.editions.length,
      ratingCount: work.ratingCount ?? 0,
      authorRatingCount: work.authors[0]?.ratingCount ?? 0,
    })
    if (worksToAdd.length >= 10_000) {
      await meili.works.addDocuments(worksToAdd)

      // TODO: why do we have to ensure Meili doesn't have too many tasks?
      // It seems to lose data if we queue too many
      // 80 and 40 were chosen arbitrarily
      const getTaskCount = async () => {
        const tasks = (await meili.works.getTasks({ limit: 100 })).results
        return tasks.filter((task) => task.status === 'enqueued').length
      }
      if ((await getTaskCount()) > 80) {
        while ((await getTaskCount()) > 40) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      worksToAdd = []
      progress.tick(10_000)
    }
  }

  // Flush remaining
  await meili.works.addDocuments(worksToAdd)
  progress.update(1)

  // Set order in which attributes are preferred during search
  await meili.works.updateSearchableAttributes(['title', 'authors', 'series', 'subtitle'])
  await meili.works.updateSortableAttributes(['reviewCount', 'authorRatingCount'])
  await meili.works.updateRankingRules([
    'words',
    'typo',
    'proximity',
    'attribute',
    'sort',
    'ratingCount:desc',
    'authorRatingCount:desc',
  ])
}
