// Server-side event handling with CAPI
// Use this in a Next.js API route (e.g., app/api/events/route.ts)
import { createHandler } from '@open-measure/capi'

const handler = createHandler({
  hashFields: ['email', 'phone'],
  onEvent(event) {
    // Drop internal/debug events
    if (event.event_name.startsWith('debug_')) return null
    return event
  },
})

export async function handleEventsPost(request: Request): Promise<Response> {
  const body = await request.json()
  const result = handler.process(body)
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  })
}
