import type { TrackedEvent } from './types'

export interface Logger {
  event(event: TrackedEvent, destinations: string[]): void
  warn(message: string): void
  error(message: string, err?: unknown): void
}

export function createLogger(debug: boolean): Logger {
  if (!debug) {
    return {
      event() {},
      warn() {},
      error() {},
    }
  }

  const prefix = '[open-measure]'

  return {
    event(event, destinations) {
      console.log(
        `${prefix} ${event.event_name}`,
        { params: event.params, destinations, event_id: event.event_id },
      )
    },
    warn(message) {
      console.warn(`${prefix} ${message}`)
    },
    error(message, err) {
      console.error(`${prefix} ${message}`, err)
    },
  }
}
