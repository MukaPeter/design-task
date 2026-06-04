export type DtcgType =
  | 'color' | 'dimension' | 'duration' | 'fontFamily' | 'fontWeight'
  | 'number' | 'string' | 'boolean' | 'gradient' | 'typography'
  | 'border' | 'shadow' | 'transition' | 'cubicBezier' | 'strokeStyle'

export type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'oklch' | 'lab' | 'lch'
export const COLOR_FORMATS: ColorFormat[] = ['hex', 'rgb', 'rgba', 'hsl', 'hsla', 'oklch', 'lab', 'lch']

export type DimensionUnit = 'px' | '%' | 'rem' | 'em' | 'pt'
export const DIMENSION_UNITS: DimensionUnit[] = ['px', '%', 'rem', 'em', 'pt']

export type DurationUnit = 'ms' | 's'
export const DURATION_UNITS: DurationUnit[] = ['ms', 's']

export type NumberIntent = 'opacity' | 'line-height' | 'scale' | 'z-index' | 'count' | 'angle' | 'generic'
export const NUMBER_INTENTS: { value: NumberIntent; label: string }[] = [
  { value: 'opacity',     label: 'Opacity' },
  { value: 'line-height', label: 'Line height' },
  { value: 'scale',       label: 'Scale / ratio' },
  { value: 'z-index',     label: 'Z-index' },
  { value: 'count',       label: 'Count' },
  { value: 'angle',       label: 'Angle' },
  { value: 'generic',     label: 'Generic' },
]
