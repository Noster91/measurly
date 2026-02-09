export interface PlaywrightHelper {
  /** Script to inject into the page to intercept tracking calls */
  getInterceptScript(): string
  /** Evaluate collected events from the page */
  getCollectScript(): string
}

/**
 * Creates a Playwright helper for E2E testing of analytics.
 * Provides scripts to inject into pages to capture tracking calls.
 *
 * @example
 * ```ts
 * import { test, expect } from '@playwright/test'
 * import { createPlaywrightHelper } from '@open-measure/qa'
 *
 * const helper = createPlaywrightHelper()
 *
 * test('tracks purchase event', async ({ page }) => {
 *   await page.addInitScript(helper.getInterceptScript())
 *   await page.goto('/checkout')
 *   await page.click('#purchase-btn')
 *
 *   const events = await page.evaluate(helper.getCollectScript())
 *   expect(events).toContainEqual(
 *     expect.objectContaining({ event_name: 'purchase' })
 *   )
 * })
 * ```
 */
export function createPlaywrightHelper(): PlaywrightHelper {
  return {
    getInterceptScript() {
      return `
        window.__om_captured_events = [];
        const originalPush = Array.prototype.push;

        // Intercept dataLayer pushes (GA4/GTM)
        window.dataLayer = window.dataLayer || [];
        const origDLPush = window.dataLayer.push.bind(window.dataLayer);
        window.dataLayer.push = function(...args) {
          for (const arg of args) {
            if (arg && arg.event) {
              window.__om_captured_events.push({
                source: 'dataLayer',
                event_name: arg.event,
                params: arg,
                timestamp: Date.now(),
              });
            }
          }
          return origDLPush(...args);
        };

        // Intercept navigator.sendBeacon (webhook destination)
        const origBeacon = navigator.sendBeacon?.bind(navigator);
        if (origBeacon) {
          navigator.sendBeacon = function(url, data) {
            try {
              const parsed = JSON.parse(data);
              if (parsed.events) {
                for (const evt of parsed.events) {
                  window.__om_captured_events.push({
                    source: 'beacon',
                    event_name: evt.event_name,
                    params: evt.params || evt,
                    timestamp: Date.now(),
                    url: url,
                  });
                }
              }
            } catch {}
            return origBeacon(url, data);
          };
        }

        // Intercept fetch (webhook destination)
        const origFetch = window.fetch?.bind(window);
        if (origFetch) {
          window.fetch = async function(url, options) {
            if (options?.body) {
              try {
                const parsed = JSON.parse(options.body);
                if (parsed.events) {
                  for (const evt of parsed.events) {
                    window.__om_captured_events.push({
                      source: 'fetch',
                      event_name: evt.event_name,
                      params: evt.params || evt,
                      timestamp: Date.now(),
                      url: typeof url === 'string' ? url : url.toString(),
                    });
                  }
                }
              } catch {}
            }
            return origFetch(url, options);
          };
        }
      `
    },
    getCollectScript() {
      return `window.__om_captured_events || []`
    },
  }
}
