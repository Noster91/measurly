# @open-measure/capi

Server-side Conversions API support for Open Measure.

## Installation

```bash
npm install @open-measure/capi
```

## Usage

```typescript
import { hashEmail, hashPhone, hashUserData } from '@open-measure/capi'

// Hash PII before sending to ad platforms
const hashedEmail = hashEmail('user@example.com')
const hashedPhone = hashPhone('+1-555-123-4567')

// Or hash all user data at once
const userData = hashUserData({
  email: 'user@example.com',
  phone: '+1-555-123-4567',
})
```

## Documentation

See the [full documentation](https://github.com/Noster91/measurly#readme) for more details.

## License

MIT
