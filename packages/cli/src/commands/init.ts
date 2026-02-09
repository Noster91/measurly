import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

type Flags = Record<string, string | boolean | undefined>

export async function init(flags: Flags): Promise<void> {
  const dest = typeof flags['dest'] === 'string' ? flags['dest'].split(',') : ['ga4']
  const framework = typeof flags['framework'] === 'string' ? flags['framework'] : 'web'
  const preset = typeof flags['preset'] === 'string' ? flags['preset'] : undefined
  const dryRun = flags['dry-run'] === true
  const format = flags['format']

  const files = generateInitFiles(dest, framework, preset)

  if (format === 'json') {
    console.log(JSON.stringify({ files: files.map((f) => ({ path: f.path, content: f.content })) }, null, 2))
    return
  }

  if (dryRun) {
    console.log('Would create the following files:')
    for (const file of files) {
      console.log(`  ${file.path}`)
    }
    return
  }

  for (const file of files) {
    const dir = file.path.substring(0, file.path.lastIndexOf('/'))
    if (dir && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(file.path, file.content)
    console.log(`Created ${file.path}`)
  }

  console.log('\nOpen Measure initialized successfully!')
  console.log(`\nNext steps:`)
  console.log(`  1. Install dependencies:`)

  const packages = [`@open-measure/${framework}`]
  for (const d of dest) {
    packages.push(`@open-measure/dest-${d}`)
  }
  console.log(`     npm install ${packages.join(' ')}`)
  console.log(`  2. Configure your tracking in the generated file`)
}

interface GeneratedFile {
  path: string
  content: string
}

function generateInitFiles(
  destinations: string[],
  framework: string,
  preset: string | undefined,
): GeneratedFile[] {
  const files: GeneratedFile[] = []

  const destImports = destinations
    .map((d) => `import { ${d} } from '@open-measure/dest-${d}'`)
    .join('\n')

  const destInstances = destinations
    .map((d) => {
      switch (d) {
        case 'ga4':
          return `    ${d}({ measurementId: 'G-XXXXXXXXXX' }),`
        case 'meta':
          return `    ${d}({ pixelId: 'YOUR_PIXEL_ID' }),`
        case 'posthog':
          return `    ${d}({ apiKey: 'phc_YOUR_KEY' }),`
        case 'gtm':
          return `    ${d}({ containerId: 'GTM-XXXXXX' }),`
        default:
          return `    ${d}({ /* config */ }),`
      }
    })
    .join('\n')

  const presetLine = preset ? `  preset: presets.${preset},\n` : ''
  const presetImport = preset ? ', presets' : ''

  if (framework === 'next') {
    files.push({
      path: 'lib/analytics.ts',
      content: `import { createTracker${presetImport} } from '@open-measure/next'
${destImports}

export const tracker = createTracker({
${presetLine}  destinations: [
${destInstances}
  ],
  autoTrack: { pageViews: true },
  consent: { analytics: true },
})
`,
    })
  } else if (framework === 'react') {
    files.push({
      path: 'src/analytics.ts',
      content: `import { createTracker${presetImport} } from '@open-measure/react'
${destImports}

export const tracker = createTracker({
${presetLine}  destinations: [
${destInstances}
  ],
  autoTrack: { pageViews: true },
  consent: { analytics: true },
})
`,
    })
  } else {
    files.push({
      path: 'analytics.ts',
      content: `import { createTracker${presetImport} } from '@open-measure/web'
${destImports}

export const tracker = createTracker({
${presetLine}  destinations: [
${destInstances}
  ],
  autoTrack: { pageViews: true },
  consent: { analytics: true },
})
`,
    })
  }

  return files
}
