import type { TrackedEvent } from '@open-measure/web'
import { hashPII } from './hash'

export interface CAPIConfig {
  /** Fields to auto-hash before forwarding */
  hashFields?: string[]
  /** Validate events before forwarding */
  validate?: boolean
  /** Custom event processor */
  onEvent?: (event: TrackedEvent) => TrackedEvent | null
}

export interface CAPIRequest {
  events: TrackedEvent[]
  user_agent?: string
  ip_address?: string
}

export interface CAPIResponse {
  processed: number
  dropped: number
  errors: string[]
}

/**
 * Creates a server-side event handler for processing analytics events.
 * Use this in API routes to receive events from the webhook destination.
 *
 * @example
 * ```ts
 * // Next.js API route
 * import { createHandler } from '@open-measure/capi'
 *
 * const handler = createHandler({
 *   hashFields: ['email', 'phone'],
 * })
 *
 * export async function POST(req: Request) {
 *   const body = await req.json()
 *   const result = handler.process(body)
 *   return Response.json(result)
 * }
 * ```
 */
export function createHandler(config: CAPIConfig = {}) {
  const hashFields = new Set(config.hashFields ?? [])

  function process(request: CAPIRequest): CAPIResponse {
    const errors: string[] = []
    let processed = 0
    let dropped = 0

    for (const event of request.events) {
      try {
        // Hash PII fields
        const processedParams = { ...event.params }
        for (const field of hashFields) {
          if (typeof processedParams[field] === 'string') {
            processedParams[field] = hashPII(processedParams[field] as string)
          }
        }

        let processedEvent: TrackedEvent | null = {
          ...event,
          params: processedParams,
        }

        // Run custom processor
        if (config.onEvent) {
          processedEvent = config.onEvent(processedEvent)
        }

        if (processedEvent) {
          processed++
        } else {
          dropped++
        }
      } catch (err) {
        errors.push(`Error processing event ${event.event_name}: ${err instanceof Error ? err.message : String(err)}`)
        dropped++
      }
    }

    return { processed, dropped, errors }
  }

  return { process }
}
