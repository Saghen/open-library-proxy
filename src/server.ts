import { BaseError as FejlError } from 'fejl'
import { AutoRouter } from 'itty-router'
import bookInfoAuthor from './bookinfo/routes/author'
import bookInfoEdition from './bookinfo/routes/edition'
import bookInfoWork from './bookinfo/routes/work'
import bookInfoSearch from './bookinfo/routes/search'
import bookInfoBulk from './bookinfo/routes/bulk'
import ingest from './ingest/ingest'

await ingest(process.env.FORCE_REBUILD === 'true')

function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    stream.pipeTo(
      new WritableStream({
        write(chunk) {
          chunks.push(chunk)
        },
        close() {
          resolve(new TextDecoder().decode(new Uint8Array(chunks)))
        },
        abort(e) {
          reject(e)
        },
      }),
    )
  })
}

const server = Bun.serve({
  async fetch(req) {
    console.log('Incoming request: ', req.url)

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
    router.get('/search', ({ query }) => bookInfoSearch(Array.isArray(query.q) ? query.q[0] : query.q ?? ''))
    router.post('/book/bulk', (req) => req.json().then(bookInfoBulk))

    return router.fetch(req)
  },
})
console.log(`Listening on http://localhost:${server.port}`)
