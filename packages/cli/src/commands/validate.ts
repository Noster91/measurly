import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

type Flags = Record<string, string | boolean | undefined>

export async function validate(flags: Flags): Promise<void> {
  const src = typeof flags['src'] === 'string' ? flags['src'] : 'src/'
  const preset = typeof flags['preset'] === 'string' ? flags['preset'] : undefined
  const strict = flags['strict'] === true
  const format = flags['format']

  const issues: Array<{ type: 'error' | 'warning'; message: string; file?: string }> = []

  // Scan source files for tracking calls
  const sourceFiles = collectSourceFiles(src)
  const trackedEvents = new Set<string>()

  for (const file of sourceFiles) {
    try {
      const content = readFileSync(file, 'utf-8')

      // Find track() calls
      const trackMatches = content.matchAll(/\.track\s*\(\s*['"]([^'"]+)['"]/g)
      for (const match of trackMatches) {
        trackedEvents.add(match[1]!)
      }

      // Check for common issues
      if (content.includes('window.') && !content.includes('typeof window')) {
        issues.push({
          type: 'warning',
          message: 'Direct window access without SSR guard',
          file,
        })
      }
    } catch {
      // Skip unreadable files
    }
  }

  // Check against preset expected events
  if (preset) {
    const presetEvents = getPresetEvents(preset)
    for (const expected of presetEvents) {
      if (!trackedEvents.has(expected)) {
        issues.push({
          type: strict ? 'error' : 'warning',
          message: `Expected event "${expected}" from preset "${preset}" not found in source`,
        })
      }
    }
  }

  // Output results
  const errors = issues.filter((i) => i.type === 'error')
  const warnings = issues.filter((i) => i.type === 'warning')

  if (format === 'json') {
    console.log(
      JSON.stringify(
        {
          valid: errors.length === 0,
          trackedEvents: Array.from(trackedEvents),
          errors,
          warnings,
        },
        null,
        2,
      ),
    )
  } else {
    console.log(`Scanned ${sourceFiles.length} files, found ${trackedEvents.size} tracked events\n`)

    if (errors.length > 0) {
      console.log('Errors:')
      for (const e of errors) {
        console.log(`  ✗ ${e.message}${e.file ? ` (${e.file})` : ''}`)
      }
    }

    if (warnings.length > 0) {
      console.log('Warnings:')
      for (const w of warnings) {
        console.log(`  ! ${w.message}${w.file ? ` (${w.file})` : ''}`)
      }
    }

    if (issues.length === 0) {
      console.log('No issues found.')
    }
  }

  if (errors.length > 0) {
    process.exit(1)
  }
}

function collectSourceFiles(dir: string): string[] {
  const files: string[] = []
  const validExts = new Set(['.ts', '.tsx', '.js', '.jsx'])

  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const full = join(dir, entry)
      try {
        const stat = statSync(full)
        if (stat.isDirectory() && entry !== 'node_modules' && entry !== 'dist') {
          files.push(...collectSourceFiles(full))
        } else if (stat.isFile() && validExts.has(extname(entry))) {
          files.push(full)
        }
      } catch {
        // Skip inaccessible entries
      }
    }
  } catch {
    // Directory doesn't exist
  }

  return files
}

function getPresetEvents(preset: string): string[] {
  const presets: Record<string, string[]> = {
    ecommerce: [
      'page_view', 'view_item', 'add_to_cart', 'begin_checkout', 'purchase',
    ],
    saas: [
      'page_view', 'sign_up', 'login', 'feature_used', 'subscribe',
    ],
    leadgen: [
      'page_view', 'generate_lead', 'form_submit',
    ],
  }
  return presets[preset] ?? []
}
