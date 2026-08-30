'use client'

import styles from './ErrorState.module.css'

export function ErrorState({ error }: { error: any }) {
  return <div className={styles.error}>{String(error)}</div>
}
