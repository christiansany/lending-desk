import { findItem } from './items'
import { getStore, nextId } from './store'
import type { Report } from './types'

export const SEVERITIES: Report['severity'][] = ['cosmetic', 'limited', 'unusable']

export interface ReportInput {
  itemId: unknown
  reporter: unknown
  email: unknown
  severity: unknown
  description: unknown
}

export function validateReport(input: ReportInput): Record<string, string> {
  const errors: Record<string, string> = {}

  if (typeof input.itemId !== 'string' || !findItem(input.itemId)) {
    errors.itemId = 'Unknown item'
  }
  if (typeof input.reporter !== 'string' || input.reporter.trim().length < 2) {
    errors.reporter = 'Please give your full name'
  }
  if (typeof input.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email)) {
    errors.email = 'This address is not reachable'
  }
  if (typeof input.severity !== 'string' || !SEVERITIES.includes(input.severity as Report['severity'])) {
    errors.severity = 'Please pick a severity'
  }
  if (typeof input.description !== 'string' || input.description.trim().length < 10) {
    errors.description = 'Please describe the damage in at least 10 characters'
  }

  return errors
}

export function createReport(input: {
  itemId: string
  reporter: string
  email: string
  severity: Report['severity']
  description: string
}): Report {
  const report: Report = {
    id: nextId('rep'),
    itemId: input.itemId,
    reporter: input.reporter.trim(),
    email: input.email.trim(),
    severity: input.severity,
    description: input.description.trim(),
    createdAt: new Date().toISOString(),
  }
  getStore().reports.push(report)
  return report
}
