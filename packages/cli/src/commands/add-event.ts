type Flags = Record<string, string | boolean | undefined>

export async function addEvent(flags: Flags): Promise<void> {
  const args = process.argv.slice(3).filter((a) => !a.startsWith('--'))
  const eventName = args[0] ?? (typeof flags['name'] === 'string' ? flags['name'] : undefined)

  if (!eventName) {
    console.error('Usage: open-measure add-event <event_name> --params "field:type,field:type"')
    process.exit(1)
  }

  const paramsStr = typeof flags['params'] === 'string' ? flags['params'] : ''
  const category = typeof flags['category'] === 'string' ? flags['category'] : 'custom'
  const description = typeof flags['description'] === 'string' ? flags['description'] : `Custom event: ${eventName}`
  const dryRun = flags['dry-run'] === true
  const format = flags['format']

  const params = paramsStr
    ? paramsStr.split(',').map((p) => {
        const [name, type] = p.trim().split(':')
        return { name: name!, type: type ?? 'string', required: false }
      })
    : []

  const eventSpec = {
    name: eventName,
    category,
    description,
    params,
  }

  if (format === 'json') {
    console.log(JSON.stringify(eventSpec, null, 2))
    return
  }

  if (dryRun) {
    console.log(`Would add event: ${eventName}`)
    console.log(`  Category: ${category}`)
    console.log(`  Description: ${description}`)
    if (params.length > 0) {
      console.log(`  Parameters:`)
      for (const p of params) {
        console.log(`    - ${p.name}: ${p.type}`)
      }
    }
    return
  }

  // Output the TypeScript code that should be added to the spec
  console.log(`Add the following to packages/spec/src/schemas.ts:\n`)
  console.log(`  {`)
  console.log(`    name: '${eventName}',`)
  console.log(`    category: '${category}',`)
  console.log(`    description: '${description}',`)
  console.log(`    params: [`)
  for (const p of params) {
    console.log(`      { name: '${p.name}', type: '${p.type}', required: false, description: '${p.name}' },`)
  }
  console.log(`    ],`)
  console.log(`  },`)
  console.log(`\nEvent spec generated. Add it to the schemas file and rebuild.`)
}
