function getString(key: string, defaultValue: string): string {
  const value = process.env[`OLP_${key}`]
  if (!value) return defaultValue
  return value
}

function getNumber(key: string, defaultValue: number): number {
  const value = process.env[`OLP_${key}`]
  if (!value) return defaultValue
  const parsed = Number(value)
  if (isNaN(parsed)) throw new Error(`Invalid number for ${key}: ${value}`)
  return parsed
}

function getBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[`OLP_${key}`]
  if (!value) return defaultValue
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error(`Invalid boolean for ${key}: ${value}`)
}

export const config = {
  hostname: getString('HOSTNAME', '0.0.0.0'),
  port: getNumber('PORT', 8080),
  forceReingest: getBoolean('FORCE_REINGEST', false),
  meili: {
    host: getString('MEILI_HOST', 'localhost:7700'),
    apiKey: getString('MEILI_MASTER_KEY', 'stringsolongandpowerfulnoonecouldguessit'),
  },
  mongo: {
    connectionString: getString(
      'MONGO_CONNECTION_STRING',
      'mongodb://open-library-proxy:stringsolongandpowerfulnoonecouldguessit@localhost:27017/open-library-proxy?authSource=admin',
    ),
  },
}
