'use client'

export function ErrorState({ error }: { error: any }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {String(error)}
    </div>
  )
}
