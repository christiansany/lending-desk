'use client'

/** Our logger. Keeps the console clean in production. */
export const log = (...args: unknown[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args)
  }
}
