export type Category = 'laptops' | 'cameras' | 'audio' | 'tools' | 'vr' | 'misc'

export interface Item {
  id: string
  name: string
  category: Category
  description: string
  serial: string
  location: string
  condition: 'new' | 'good' | 'worn'
  dailyRate: number
}

export interface Reservation {
  id: string
  itemId: string
  name: string
  email: string
  /** ISO date, YYYY-MM-DD */
  from: string
  /** ISO date, YYYY-MM-DD */
  to: string
  purpose: string
  createdAt: string
}

export interface Report {
  id: string
  itemId: string
  reporter: string
  email: string
  severity: 'cosmetic' | 'limited' | 'unusable'
  description: string
  createdAt: string
}
