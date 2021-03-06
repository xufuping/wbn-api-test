import winston, { createLogger, format, transports } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import Dotenv from 'dotenv'
Dotenv.config()

const { combine, colorize, timestamp, label, printf, json, splat } = format

const printFormat = printf((msg) => `${msg.timestamp} ${msg.label} ${msg.level}: ${msg.message}`)
const logFormat = (labelStr?: string, isJson: boolean = false) => {
  const common = combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss' // make sure localtime
    }),
    timestamp(),
    label({ label: labelStr ?? '' }),
    splat()
  )
  return combine(common, isJson ? json() : printFormat)
}

function newRotateFile (filename: string, level: string = 'info', isJson: boolean = true) {
  return new DailyRotateFile({
    level,
    filename: `logs/${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    handleExceptions: true,
    json: isJson,
    createSymlink: true,
    symlinkName: `${filename}.log`,
    maxSize: '20m',
    maxFiles: 20
  })
}

function consoleLog (label: string, consoleLevel: string) {
  return new transports.Console({
    level: consoleLevel,
    format: combine(colorize(), logFormat(label, false))
  })
}

export function getAppLogger (label: string = '', opt?: { isJson: boolean; consoleLevel: string }) {
  const isJson = opt?.isJson ?? true
  let consoleLevel = opt?.consoleLevel ?? 'info'
  const format = logFormat(label, isJson)
  const trans: any[] = [newRotateFile('error', 'error'), newRotateFile('app')]
  if (process.env.NODE_ENV === 'dev') {
    consoleLevel = 'debug'
  }
  trans.push(consoleLog(label, consoleLevel))

  return createLogger({
    format,
    transports: trans,
    exceptionHandlers: [newRotateFile('exception', 'error', false)],
    exitOnError: true
  })
}

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf((info) => `${info.timestamp} | ${info.level}: ${JSON.stringify(info.message)}`)
  ),
  defaultMeta: { service: 'trading-bot' },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({ level: 'debug' })
  ]
})
