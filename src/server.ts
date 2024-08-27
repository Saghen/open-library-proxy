import { BadRequest, BaseError as FejlError } from 'fejl'
import { AutoRouter } from 'itty-router'
import bookInfoAuthor from './bookinfo/routes/author'
import bookInfoEdition from './bookinfo/routes/edition'
import bookInfoWork from './bookinfo/routes/work'
import bookInfoSearch from './bookinfo/routes/search'
import bookInfoBulk from './bookinfo/routes/bulk'
import ingest from './ingest/ingest'
import { config } from './config'

await ingest(config.forceReingest)

// TODO: healthz always returns 200
// TODO: readyz returns 200 when ingestion is complete
const server = Bun.serve({
  hostname: config.hostname,
  port: config.port,
  async fetch(req) {
    console.log('Incoming request:', req.url)

    const router = AutoRouter({
      base: '/bookinfo/v1',
      catch(err) {
        if (!(err instanceof FejlError)) console.error(err)
        const message = err instanceof FejlError ? err.message : 'Internal Server Error'
        const status = err instanceof FejlError ? err.status : 500
        return new Response(JSON.stringify({ message }), { status })
      },
    })

    router.get('/author/:id', ({ params: { id } }) => bookInfoAuthor(id))
    router.get('/edition/:id', ({ params: { id } }) => bookInfoEdition(id))
    router.get('/work/:id', ({ params: { id } }) => bookInfoWork(id))
    router.post('/book/bulk', (req) => req.json().then(bookInfoBulk))

    router.get('/search', ({ query }) => {
      BadRequest.assert(
        typeof query.q === 'string' && query.q.length > 0,
        'Query (`q`) must be defined in the query parameters a single time as a non-empty string',
      )
      return bookInfoSearch(query.q)
    })

    return router.fetch(req)
  },
})
console.log(`Listening on http://${config.hostname}:${config.port}`)

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...')
  server.stop()
})
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...')
  server.stop()
})
