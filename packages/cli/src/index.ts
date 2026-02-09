#!/usr/bin/env node

import { parseArgs } from './args'
import { init } from './commands/init'
import { createDestination } from './commands/create-destination'
import { addEvent } from './commands/add-event'
import { validate } from './commands/validate'
import { doctor } from './commands/doctor'
import { generateContext } from './commands/generate-context'

const COMMANDS: Record<string, (args: Record<string, string | boolean | undefined>) => Promise<void>> = {
  init,
  'create-destination': createDestination,
  'add-event': addEvent,
  validate,
  doctor,
  'generate-context': generateContext,
}

async function main() {
  const { command, flags } = parseArgs(process.argv.slice(2))

  if (!command || command === 'help' || flags['help']) {
    printHelp()
    process.exit(0)
  }

  if (flags['version']) {
    console.log('0.0.1')
    process.exit(0)
  }

  const handler = COMMANDS[command]
  if (!handler) {
    console.error(`Unknown command: ${command}`)
    console.error(`Run "open-measure help" for available commands.`)
    process.exit(1)
  }

  try {
    await handler(flags)
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  }
}

function printHelp() {
  console.log(`
open-measure CLI v0.0.1

Usage: open-measure <command> [options]

Commands:
  init                    Initialize Open Measure in your project
  create-destination      Scaffold a new destination plugin
  add-event              Add a new event to the spec
  validate               Validate implementation against spec
  doctor                 Check project health
  generate-context       Generate llm_context.md

Global Options:
  --help                 Show help
  --version              Show version
  --dry-run              Preview changes without applying
  --format json          Output in JSON format

Examples:
  open-measure init --dest ga4,meta --framework next --preset ecommerce
  open-measure create-destination linkedin-ads --consent marketing
  open-measure add-event webinar_signup --params "id:string,title:string"
  open-measure validate --src src/ --preset ecommerce --strict
  open-measure doctor --format json
  open-measure generate-context --output llm_context.md
`)
}

void main()
