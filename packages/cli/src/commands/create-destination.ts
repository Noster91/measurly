import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

type Flags = Record<string, string | boolean | undefined>

export async function createDestination(flags: Flags): Promise<void> {
  // Get destination name from positional args or flags
  const args = process.argv.slice(3).filter((a) => !a.startsWith('--'))
  const name = args[0] ?? (typeof flags['name'] === 'string' ? flags['name'] : undefined)

  if (!name) {
    console.error('Usage: open-measure create-destination <name> [--consent analytics|marketing]')
    process.exit(1)
  }

  const consent = typeof flags['consent'] === 'string' ? flags['consent'] : 'analytics'
  const dryRun = flags['dry-run'] === true
  const format = flags['format']

  const pkgName = name.startsWith('dest-') ? name : `dest-${name}`
  const basePath = join('packages', pkgName)
  const files = generateDestinationFiles(name, pkgName, consent)

  if (format === 'json') {
    console.log(JSON.stringify({ files: files.map((f) => ({ path: f.path })) }, null, 2))
    return
  }

  if (dryRun) {
    console.log(`Would create destination scaffold at ${basePath}/`)
    for (const file of files) {
      console.log(`  ${file.path}`)
    }
    return
  }

  for (const file of files) {
    const fullPath = join(basePath, file.path)
    const dir = fullPath.substring(0, fullPath.lastIndexOf('/'))
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(fullPath, file.content)
    console.log(`Created ${fullPath}`)
  }

  console.log(`\nDestination "${name}" scaffolded at ${basePath}/`)
  console.log(`\nNext steps:`)
  console.log(`  1. Fill in the TODOs in src/index.ts`)
  console.log(`  2. Add event name mapping in src/mapping.ts`)
  console.log(`  3. Run: pnpm build && pnpm test`)
}

interface GeneratedFile {
  path: string
  content: string
}

function toPascalCase(s: string): string {
  return s
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
}

function generateDestinationFiles(
  name: string,
  _pkgName: string,
  consent: string,
): GeneratedFile[] {
  const pascal = toPascalCase(name)

  return [
    {
      path: 'src/index.ts',
      content: `import { defineDestination } from '@open-measure/web'
import type { ${pascal}Config } from './config'
import { EVENT_NAME_MAP } from './mapping'

export type { ${pascal}Config } from './config'

export const ${name.replace(/-/g, '_')} = defineDestination<${pascal}Config>({
  name: '${name}',
  version: '1.0.0',
  consentCategory: '${consent}',
  setup(config) {
    return {
      async init() {
        // TODO: Load the third-party script or initialize the SDK
        if (typeof window === 'undefined') return
      },
      track(event) {
        // TODO: Send event to the platform
        if (typeof window === 'undefined') return
        console.log('[${name}] track:', event.event_name, event.params)
      },
      identify(userId, traits) {
        // TODO: Identify user on the platform
        if (typeof window === 'undefined') return
        console.log('[${name}] identify:', userId, traits)
      },
      mapEventName(eventName) {
        return EVENT_NAME_MAP[eventName] ?? eventName
      },
    }
  },
})
`,
    },
    {
      path: 'src/config.ts',
      content: `export interface ${pascal}Config {
  // TODO: Add required configuration fields
  /** API key or pixel ID for the platform */
  apiKey: string
  /** Enable debug mode */
  debug?: boolean
}
`,
    },
    {
      path: 'src/mapping.ts',
      content: `/** Map Open Measure event names to platform-specific event names */
export const EVENT_NAME_MAP: Record<string, string> = {
  // TODO: Add event name mappings
  // page_view: 'PageView',
  // purchase: 'Purchase',
}
`,
    },
    {
      path: '__tests__/${name}.test.ts'.replace('${name}', name),
      content: `import { describe, it, expect } from 'vitest'
import { ${name.replace(/-/g, '_')} } from '../src/index'

describe('${name} destination', () => {
  it('creates destination with correct metadata', () => {
    const dest = ${name.replace(/-/g, '_')}({ apiKey: 'test-key' })
    expect(dest.name).toBe('${name}')
    expect(dest.version).toBe('1.0.0')
    expect(dest.consentCategory).toBe('${consent}')
  })

  it('init does not throw in Node', async () => {
    const dest = ${name.replace(/-/g, '_')}({ apiKey: 'test-key' })
    await expect(dest.init()).resolves.toBeUndefined()
  })

  it('track does not throw in Node', () => {
    const dest = ${name.replace(/-/g, '_')}({ apiKey: 'test-key' })
    expect(() =>
      dest.track({
        event_name: 'test_event',
        params: {},
        timestamp: Date.now(),
        event_id: 'test',
      }),
    ).not.toThrow()
  })
})
`,
    },
    {
      path: 'package.json',
      content: JSON.stringify(
        {
          name: `@open-measure/dest-${name}`,
          version: '0.0.1',
          description: `${pascal} destination for Open Measure`,
          type: 'module',
          main: './dist/index.cjs',
          module: './dist/index.js',
          types: './dist/index.d.ts',
          exports: {
            '.': {
              types: './dist/index.d.ts',
              import: './dist/index.js',
              require: './dist/index.cjs',
            },
          },
          files: ['dist'],
          scripts: {
            build: 'tsup',
            test: 'vitest run',
            lint: 'eslint src/',
            typecheck: 'tsc --noEmit',
            clean: 'rm -rf dist .turbo',
          },
          dependencies: {
            '@open-measure/web': 'workspace:*',
          },
          sideEffects: false,
          publishConfig: { access: 'public' },
        },
        null,
        2,
      ) + '\n',
    },
    {
      path: 'tsconfig.json',
      content: JSON.stringify(
        {
          extends: '../../tsconfig.json',
          compilerOptions: { outDir: './dist', rootDir: './src' },
          include: ['src'],
        },
        null,
        2,
      ) + '\n',
    },
    {
      path: 'tsup.config.ts',
      content: `import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
})
`,
    },
  ]
}
