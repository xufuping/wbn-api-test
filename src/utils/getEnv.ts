import dotenv from 'dotenv'
dotenv.config()

export const getStringEnv = (envName: string): string => {
  const value = process.env[envName]
  if (!value) {
    throw new Error(`Configuration ${envName} is not specified`)
  }
  return value
}

export const getStringOrUndefinedEnv = (envName: string, must?: boolean): string | undefined => {
  const value = process.env[envName]
  if (!value && must) {
    throw new Error(`Configuration ${envName} is not specified`)
  }
  return value
}

export const getNumEnv = (envName: string): number => {
  const value = Number(getStringEnv(envName))
  if (Number.isNaN(value)) {
    throw new Error(`Configuration ${envName} is not a valid number`)
  }
  return value
}

export const getBooleanEnv = (envName: string): boolean => {
  try {
    const envValue = getStringEnv(envName)
    return Boolean(envValue === 'true')
  } catch (error) {
    return false
  }
}
