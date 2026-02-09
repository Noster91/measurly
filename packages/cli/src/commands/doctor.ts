import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

type Flags = Record<string, string | boolean | undefined>

interface Check {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
}

export async function doctor(flags: Flags): Promise<void> {
  const format = flags['format']
  const checks: Check[] = []

  // Check 1: package.json exists
  checks.push(checkFileExists('package.json', 'package.json found', 'No package.json found'))

  // Check 2: @open-measure/web is installed
  checks.push(checkDependency('@open-measure/web'))

  // Check 3: At least one destination is installed
  checks.push(checkDestinations())

  // Check 4: TypeScript config exists
  checks.push(checkFileExists('tsconfig.json', 'TypeScript config found', 'No tsconfig.json found'))

  // Check 5: Analytics file exists
  const analyticsFiles = [
    'analytics.ts', 'src/analytics.ts', 'lib/analytics.ts',
    'analytics.js', 'src/analytics.js', 'lib/analytics.js',
  ]
  const hasAnalytics = analyticsFiles.some((f) => existsSync(f))
  checks.push({
    name: 'Analytics config',
    status: hasAnalytics ? 'pass' : 'warn',
    message: hasAnalytics ? 'Analytics configuration found' : 'No analytics configuration file found',
  })

  if (format === 'json') {
    console.log(JSON.stringify({ checks, healthy: checks.every((c) => c.status !== 'fail') }, null, 2))
    return
  }

  console.log('Open Measure Doctor\n')
  for (const check of checks) {
    const icon = check.status === 'pass' ? 'OK' : check.status === 'warn' ? '!!' : 'XX'
    console.log(`  [${icon}] ${check.name}: ${check.message}`)
  }

  const fails = checks.filter((c) => c.status === 'fail')
  const warns = checks.filter((c) => c.status === 'warn')
  console.log(`\n${checks.length - fails.length - warns.length} passed, ${warns.length} warnings, ${fails.length} errors`)
}

function checkFileExists(path: string, passMsg: string, failMsg: string): Check {
  return {
    name: path,
    status: existsSync(path) ? 'pass' : 'fail',
    message: existsSync(path) ? passMsg : failMsg,
  }
}

function checkDependency(name: string): Check {
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    const found = name in deps
    return {
      name: `${name} dependency`,
      status: found ? 'pass' : 'warn',
      message: found ? `${name} found in dependencies` : `${name} not found in dependencies`,
    }
  } catch {
    return {
      name: `${name} dependency`,
      status: 'fail',
      message: 'Could not read package.json',
    }
  }
}

function checkDestinations(): Check {
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    const dests = Object.keys(deps).filter((d) => d.startsWith('@open-measure/dest-'))
    return {
      name: 'Destinations',
      status: dests.length > 0 ? 'pass' : 'warn',
      message: dests.length > 0 ? `Found ${dests.length} destination(s): ${dests.join(', ')}` : 'No destinations installed',
    }
  } catch {
    return {
      name: 'Destinations',
      status: 'fail',
      message: 'Could not read package.json',
    }
  }
}
