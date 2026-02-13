# @open-measure/cli

CLI tool for Open Measure - scaffolding, validation, and diagnostics.

## Installation

```bash
npm install -g @open-measure/cli
# or use with npx
npx open-measure <command>
```

## Commands

### init

Initialize Open Measure in your project:

```bash
npx open-measure init --dest ga4,meta --framework next
```

### doctor

Check your Open Measure configuration:

```bash
npx open-measure doctor
```

### validate

Validate tracking implementation in your codebase:

```bash
npx open-measure validate --src ./src
```

### create-destination

Scaffold a new destination plugin:

```bash
npx open-measure create-destination my-platform
```

## Documentation

See the [full documentation](https://github.com/Noster91/measurly#readme) for more details.

## License

MIT
