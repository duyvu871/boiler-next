// 'use client'
// Jotai store for the 3D Playground feature. This centralizes UI and scene state
// so view/components can stay simple and predictable.

import { atom } from 'jotai'
import type { Mesh } from 'three'
import * as THREE from 'three'

// -----------------------------
// Types
// -----------------------------

/**
 * A single mesh morph target entry. Multiple meshes can share the same morph target name,
 * therefore each shape key name maps to a list of mesh/index pairs.
 */
export interface ShapeKeyEntry {
  mesh: Mesh
  index: number
}

/**
 * Shape keys grouped by their base name. A group can be either:
 * - single: a plain 0..1 slider controls one morph target
 * - combined: a -1..1 slider controls an Up/Down morph target pair
 */
export type GroupedShapeKey =
  | {
      kind: 'single'
      label: string
      key: string
      entries: ShapeKeyEntry[]
    }
  | {
      kind: 'combined'
      label: string
      base: string
      upKey: string
      downKey: string
      upEntries: ShapeKeyEntry[]
      downEntries: ShapeKeyEntry[]
    }

export type ShapeKeyCategory = 'general' | 'detailed' | 'advanced'

/** Model metadata used to render/load models */
export interface ModelInfo {
  name: string
  url: string
  category: 'body' | 'top' | 'bottom'
  defaultVisible?: boolean
  scale?: number
}

// -----------------------------
// Constants
// -----------------------------

// Keyword buckets to infer a category for each shape key slider.
export const GENERAL_KEYWORDS = ['height', 'weight'] as const
export const DETAILED_KEYWORDS = [
  'bicep',
  'breast',
  'bust',
  'crotch',
  'hand',
  'head',
  'hip_volume',
  'low_hip',
  'high_hip',
  'inseam',
  'neck',
  'shoulder',
  'thigh',
  'under_bust',
  'waist',
] as const
export const ADVANCED_KEYWORDS = ['shape', 'space', 'dips', 'curvilinear'] as const

// -----------------------------
// Atoms: UI state
// -----------------------------

/** Loading overlay visibility and current step text */
export const isLoadingAtom = atom<boolean>(true)
export const loadingTextAtom = atom<string>('Initializing...')

/** Camera zoom control. Value follows UI 0.5..6.0; we convert to distance internally. */
export const zoomValueAtom = atom<number>(4.5)

/** Which clothing is selected for each category */
export const selectedTopAtom = atom<'none' | 'bodice' | 'shirt'>('none')
export const selectedBottomAtom = atom<'none' | 'skirt'>('none')

/** Model visibility flags keyed by model name */
export const modelVisibilityAtom = atom<Record<string, boolean>>({})

/** UI: show r3f-perf overlay */
export const showPerfAtom = atom<boolean>(false)

// -----------------------------
// Atoms: Scene & morph targets
// -----------------------------

/**
 * All discovered shape keys indexed by name → list of mesh/index entries.
 * This is populated when GLTFs finish loading.
 */
export const shapeKeysAtom = atom<Record<string, ShapeKeyEntry[]>>({})

/**
 * Derived: shape keys grouped into UI slider definitions.
 * We compute this from shapeKeysAtom; grouping Up/Down pairs into one slider.
 */
export const groupedShapeKeysAtom = atom<GroupedShapeKey[]>((get) => {
  const all = get(shapeKeysAtom)
  const processed = new Set<string>()
  const groups: GroupedShapeKey[] = []

  for (const key of Object.keys(all)) {
    if (processed.has(key)) continue

    const lower = key.toLowerCase()
    const endsWithUp = lower.endsWith('up')
    const endsWithDown = lower.endsWith('down')

    if (endsWithUp || endsWithDown) {
      const base = endsWithUp ? key.slice(0, -2) : key.slice(0, -4)
      const upKey = endsWithUp ? key : `${base}Up`
      const downKey = endsWithDown ? key : `${base}Down`

      if (all[upKey] && all[downKey]) {
        groups.push({
          kind: 'combined',
          label: base,
          base,
          upKey,
          downKey,
          upEntries: all[upKey],
          downEntries: all[downKey],
        })
        processed.add(upKey)
        processed.add(downKey)
        continue
      }
    }

    // Fallback to single slider
    groups.push({ kind: 'single', label: key, key, entries: all[key] })
  }

  return groups.sort((a, b) => a.label.localeCompare((b as any).label))
})

/** Categorize a shape key by name to route it to the right panel column */
export const categorizeShapeKeyAtom = atom(
  () =>
    (keyName: string): ShapeKeyCategory => {
      const lower = keyName.toLowerCase()
      if (GENERAL_KEYWORDS.some((k) => lower.includes(k))) return 'general'
      if (ADVANCED_KEYWORDS.some((k) => lower.includes(k))) return 'advanced'
      if (DETAILED_KEYWORDS.some((k) => lower.includes(k))) return 'detailed'
      return 'detailed'
    },
)

// -----------------------------
// Actions
// -----------------------------

/** Merge discovered shape keys for a model into the global store. */
export const addShapeKeysAtom = atom(null, (get, set, payload: Record<string, ShapeKeyEntry[]>) => {
  const prev = get(shapeKeysAtom)
  const merged: Record<string, ShapeKeyEntry[]> = { ...prev }
  for (const [key, entries] of Object.entries(payload)) {
    merged[key] = [...(merged[key] ?? []), ...entries]
  }
  set(shapeKeysAtom, merged)
})

/** Reset all morph target influences to 0 and reset UI slider state. */
export const resetAllShapeKeysAtom = atom(null, (get, set) => {
  const all = get(shapeKeysAtom)
  Object.values(all).forEach((entries) => {
    entries.forEach((e) => {
      if (e.mesh.morphTargetInfluences) e.mesh.morphTargetInfluences[e.index] = 0
    })
  })
})

/** Apply a single-slider (0..1) morph target value across all mesh entries. */
export const setSingleShapeKeyValueAtom = atom(
  null,
  (get, _set, params: { key: string; value: number }) => {
    const { key, value } = params
    const all = get(shapeKeysAtom)
    const entries = all[key] || []
    entries.forEach((e) => {
      if (e.mesh.morphTargetInfluences) e.mesh.morphTargetInfluences[e.index] = value
    })
  },
)

/** Apply a combined Up/Down (-1..1) value to a paired morph target group. */
export const setCombinedShapeKeyValueAtom = atom(
  null,
  (
    get,
    _set,
    params: { upKey: string; downKey: string; value: number },
  ) => {
    const { upKey, downKey, value } = params
    const all = get(shapeKeysAtom)
    const upEntries = all[upKey] || []
    const downEntries = all[downKey] || []

    if (value > 0) {
      upEntries.forEach((e) => {
        if (e.mesh.morphTargetInfluences) e.mesh.morphTargetInfluences[e.index] = value
      })
      downEntries.forEach((e) => {
        if (e.mesh.morphTargetInfluences) e.mesh.morphTargetInfluences[e.index] = 0
      })
    } else if (value < 0) {
      const abs = Math.abs(value)
      downEntries.forEach((e) => {
        if (e.mesh.morphTargetInfluences) e.mesh.morphTargetInfluences[e.index] = abs
      })
      upEntries.forEach((e) => {
        if (e.mesh.morphTargetInfluences) e.mesh.morphTargetInfluences[e.index] = 0
      })
    } else {
      upEntries.forEach((e) => {
        if (e.mesh.morphTargetInfluences) e.mesh.morphTargetInfluences[e.index] = 0
      })
      downEntries.forEach((e) => {
        if (e.mesh.morphTargetInfluences) e.mesh.morphTargetInfluences[e.index] = 0
      })
    }
  },
)

/** Update loading overlay text. Useful while models are loading sequentially. */
export const setLoadingTextAtom = atom(null, (_get, set, text: string) => {
  set(loadingTextAtom, text)
})

/** Update visibility for a model by name. */
export const setModelVisibleAtom = atom(null, (get, set, params: { name: string; visible: boolean }) => {
  const next = { ...get(modelVisibilityAtom), [params.name]: params.visible }
  set(modelVisibilityAtom, next)
})


