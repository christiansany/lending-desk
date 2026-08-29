import { readJson } from '@/server/body'
import { fail, handleRequest } from '@/server/http'
import { validationFailed } from '@/server/problem'
import { createReport, validateReport, type ReportInput } from '@/server/reports'
import { getStore } from '@/server/store'
import type { Report } from '@/server/types'

export const dynamic = 'force-dynamic'

export function GET(request: Request): Promise<Response> {
  return handleRequest('reports', request, () => {
    const itemId = new URL(request.url).searchParams.get('itemId')
    const all = getStore().reports
    const reports = itemId ? all.filter((r) => r.itemId === itemId) : all
    return { body: { reports, total: reports.length } }
  })
}

export function POST(request: Request): Promise<Response> {
  return handleRequest('reports', request, async () => {
    const input = (await readJson(request)) as unknown as ReportInput
    const errors = validateReport(input)
    if (Object.keys(errors).length > 0) fail(validationFailed(errors))

    return {
      status: 201,
      body: createReport(
        input as {
          itemId: string
          reporter: string
          email: string
          severity: Report['severity']
          description: string
        },
      ),
    }
  })
}
