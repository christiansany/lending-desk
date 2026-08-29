import type { Category, Item, Reservation } from './types'

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'laptops', label: 'Laptops' },
  { value: 'cameras', label: 'Cameras' },
  { value: 'audio', label: 'Audio' },
  { value: 'tools', label: 'Tools' },
  { value: 'vr', label: 'VR' },
  { value: 'misc', label: 'Misc' },
]

const LOCATIONS = ['Shelf A1', 'Shelf A2', 'Shelf B1', 'Shelf B2', 'Cabinet C', 'Storage room']
const CONDITIONS: Item['condition'][] = ['new', 'good', 'worn']

/**
 * 47 items. The number matters: with the default limit of 12 the list has
 * four pages, so pagination is not optional.
 */
const RAW: [string, Category, string][] = [
  ['MacBook Pro 14"', 'laptops', 'M4 Pro, 32 GB RAM, 1 TB SSD. Charger included.'],
  ['MacBook Air 13"', 'laptops', 'M3, 16 GB RAM. Light enough for field work.'],
  ['ThinkPad X1 Carbon', 'laptops', 'Gen 12, Ubuntu preinstalled.'],
  ['ThinkPad P1 Mobile Workstation', 'laptops', 'RTX A2000, for rendering jobs.'],
  ['Dell XPS 15', 'laptops', 'Windows 11, touch display.'],
  ['Framework Laptop 13', 'laptops', 'Repairable. Spare mainboard in Cabinet C.'],
  ['Surface Pro 11', 'laptops', 'Tablet mode, pen included.'],
  ['Chromebook Plus 14', 'laptops', 'For kiosk and demo setups.'],
  ['Canon EOS R6 Mark II', 'cameras', 'Full frame, RF 24-105mm kit lens.'],
  ['Canon EOS R50', 'cameras', 'Compact APS-C body, good for interviews.'],
  ['Sony A7 IV', 'cameras', 'Full frame, two batteries.'],
  ['Sony ZV-E10 II', 'cameras', 'Vlogging body with flip screen.'],
  ['Nikon Z6 III', 'cameras', 'Body only, adapters in Cabinet C.'],
  ['Fujifilm X-T5', 'cameras', 'APS-C, 18-55mm lens.'],
  ['GoPro Hero 13', 'cameras', 'Waterproof housing and chest mount.'],
  ['DJI Osmo Pocket 3', 'cameras', 'Gimbal camera, one spare card.'],
  ['Insta360 X4', 'cameras', '360 degree, invisible selfie stick.'],
  ['Blackmagic Pocket 6K', 'cameras', 'Needs the V-mount battery from Shelf B2.'],
  ['Rode NT-USB+', 'audio', 'USB condenser microphone, table stand.'],
  ['Rode Wireless PRO', 'audio', 'Two transmitters, one receiver, lav mics.'],
  ['Shure SM7B', 'audio', 'Needs the Cloudlifter, stored with it.'],
  ['Shure MV7+', 'audio', 'USB and XLR, podcast workhorse.'],
  ['Zoom H6 Recorder', 'audio', 'Six tracks, SD card included.'],
  ['Zoom F3 Field Recorder', 'audio', '32 bit float, no gain staging needed.'],
  ['Sennheiser HD 25', 'audio', 'Closed monitoring headphones.'],
  ['Sony WH-1000XM5', 'audio', 'Noise cancelling, for editing in the open office.'],
  ['Focusrite Scarlett 4i4', 'audio', 'USB interface, cables in the pouch.'],
  ['JBL Eon One Compact', 'audio', 'Battery PA speaker for workshops.'],
  ['Bosch GSR 18V-55 Drill', 'tools', 'Two batteries, bit set.'],
  ['Bosch GLM 50-27 Laser Measure', 'tools', 'Range 50 m.'],
  ['Makita Impact Driver', 'tools', 'For the exhibition stand build.'],
  ['Fluke 117 Multimeter', 'tools', 'True RMS, test leads included.'],
  ['Hakko FX-888D Soldering Station', 'tools', 'Tips in the drawer below.'],
  ['Rigol DS1054Z Oscilloscope', 'tools', '4 channels, probes included.'],
  ['Prusa MK4S 3D Printer', 'tools', 'Bring your own filament.'],
  ['Cricut Maker 3', 'tools', 'Cutting mats in Storage room.'],
  ['Meta Quest 3', 'vr', '512 GB, two controllers, charging dock.'],
  ['Meta Quest 3S', 'vr', '128 GB, lighter head strap.'],
  ['Valve Index Kit', 'vr', 'Needs base stations, ask at the desk.'],
  ['HTC Vive XR Elite', 'vr', 'Passthrough colour, prescription lens inserts.'],
  ['Apple Vision Pro', 'vr', 'Demo unit. Two hour slots only.'],
  ['PICO 4 Ultra', 'vr', 'For the ergonomics study.'],
  ['Anker 737 Power Bank', 'misc', '24000 mAh, 140 W USB-C.'],
  ['Elgato Stream Deck +', 'misc', 'For the recording setup.'],
  ['Manfrotto Tripod 190', 'misc', 'Ball head mounted.'],
  ['Ring Light 18"', 'misc', 'Bi-colour, floor stand.'],
  ['Travel Router GL-MT3000', 'misc', 'For workshops in rooms without wifi.'],
]

function serial(index: number): string {
  return `LD-${String(1000 + index * 7).padStart(4, '0')}`
}

export function createItems(): Item[] {
  return RAW.map(([name, category, description], i) => ({
    id: `item-${String(i + 1).padStart(3, '0')}`,
    name,
    category,
    description,
    serial: serial(i),
    location: LOCATIONS[i % LOCATIONS.length],
    condition: CONDITIONS[i % CONDITIONS.length],
    dailyRate: 5 + ((i * 3) % 40),
  }))
}

/** Fixed date so the seed reservations stay stable relative to "today". */
function isoDay(offsetDays: number): string {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

/**
 * Seed reservations. item-001 and item-009 are taken from tomorrow, so a
 * naive "reserve this" always runs into a 409 sooner or later.
 */
export function createReservations(): Reservation[] {
  return [
    {
      id: 'res-001',
      itemId: 'item-001',
      name: 'Rahel Bosshard',
      email: 'rahel.bosshard@example.com',
      from: isoDay(1),
      to: isoDay(5),
      purpose: 'Field recording for the documentary module',
      createdAt: isoDay(-3) + 'T09:12:00.000Z',
    },
    {
      id: 'res-002',
      itemId: 'item-009',
      name: 'Timo Widmer',
      email: 'timo.widmer@example.com',
      from: isoDay(2),
      to: isoDay(4),
      purpose: 'Product photos for the semester exhibition',
      createdAt: isoDay(-2) + 'T14:40:00.000Z',
    },
    {
      id: 'res-003',
      itemId: 'item-037',
      name: 'Nadia Keller',
      email: 'nadia.keller@example.com',
      from: isoDay(0),
      to: isoDay(2),
      purpose: 'VR usability test',
      createdAt: isoDay(-1) + 'T08:05:00.000Z',
    },
  ]
}

export const ITEM_COUNT = RAW.length
