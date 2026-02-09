export interface ParsedArgs {
  command: string | undefined
  positional: string[]
  flags: Record<string, string | boolean | undefined>
}

/**
 * Parse CLI arguments into command, positional args, and flags.
 * Supports --flag, --flag=value, and --flag value patterns.
 * No external dependencies.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, string | boolean | undefined> = {}
  const positional: string[] = []
  let command: string | undefined

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!
    if (arg.startsWith('--')) {
      const eqIndex = arg.indexOf('=')
      if (eqIndex !== -1) {
        flags[arg.slice(2, eqIndex)] = arg.slice(eqIndex + 1)
      } else {
        const next = argv[i + 1]
        if (next && !next.startsWith('--')) {
          flags[arg.slice(2)] = next
          i++
        } else {
          flags[arg.slice(2)] = true
        }
      }
    } else if (!command) {
      command = arg
    } else {
      positional.push(arg)
    }
  }

  return { command, positional, flags }
}
