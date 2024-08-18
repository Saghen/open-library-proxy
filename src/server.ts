import { AutoRouter } from 'itty-router'
import bookInfoAuthor from './bookinfo/routes/author'
import bookInfoEdition from './bookinfo/routes/edition'
import bookInfoWork from './bookinfo/routes/work'
import ingest from './ingest/ingest'

await ingest(process.env.FORCE_REBUILD === 'true')

const server = Bun.serve({
  fetch(req) {
    const router = AutoRouter({
      base: '/bookinfo/v1',
      catch(err, req) {
        console.error(err)
        return new Response(err.message, { status: 500 })
      },
    })

    router.get('/author/:id', ({ params: { id } }) => bookInfoAuthor(id))
    router.get('/edition/:id', ({ params: { id } }) => bookInfoEdition(id))
    router.get('/work/:id', ({ params: { id } }) => bookInfoWork(id))

    return router.fetch(req)
  },
})
console.log(`Listening on http://localhost:${server.port}`)
