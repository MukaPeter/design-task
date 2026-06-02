import type { ColorFormat } from './types'

export function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '')
  if (clean.length !== 3 && clean.length !== 6) return null
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return [0, 0, Math.round(l * 100)]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / d + 2) / 6
  else h = ((rn - gn) / d + 4) / 6
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function rgbToOklch(r: number, g: number, b: number): [number, number, number] {
  const lin = (v: number) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
  const lr = lin(r), lg = lin(g), lb = lin(b)
  const x = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb
  const z = 0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z)
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z)
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z)
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
  const bv = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
  const C = Math.sqrt(a * a + bv * bv)
  const h = Math.atan2(bv, a) * 180 / Math.PI
  return [Math.round(L * 100) / 100, Math.round(C * 10000) / 10000, Math.round((h < 0 ? h + 360 : h) * 10) / 10]
}

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const lin = (v: number) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
  const lr = lin(r), lg = lin(g), lb = lin(b)
  const x = (0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb) / 0.95047
  const y = (0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb) / 1.00000
  const z = (0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb) / 1.08883
  const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116
  const L = 116 * f(y) - 16
  const a = 500 * (f(x) - f(y))
  const bv = 200 * (f(y) - f(z))
  return [Math.round(L * 10) / 10, Math.round(a * 10) / 10, Math.round(bv * 10) / 10]
}

export function convertColor(hex: string, format: ColorFormat): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const [r, g, b] = rgb
  switch (format) {
    case 'hex':   return hex
    case 'rgb':   return `rgb(${r} ${g} ${b})`
    case 'rgba':  return `rgba(${r}, ${g}, ${b}, 1)`
    case 'hsl':   { const [h, s, l] = rgbToHsl(r, g, b); return `hsl(${h} ${s}% ${l}%)` }
    case 'hsla':  { const [h, s, l] = rgbToHsl(r, g, b); return `hsla(${h}, ${s}%, ${l}%, 1)` }
    case 'oklch': { const [L, C, h] = rgbToOklch(r, g, b); return `oklch(${L} ${C} ${h})` }
    case 'lab':   { const [L, a, bv] = rgbToLab(r, g, b); return `lab(${L} ${a} ${bv})` }
    case 'lch':   { const [L, a, bv] = rgbToLab(r, g, b); const C = Math.round(Math.sqrt(a*a + bv*bv)*10)/10; const h = Math.round(Math.atan2(bv, a)*180/Math.PI*10)/10; return `lch(${L} ${C} ${h < 0 ? h + 360 : h})` }
  }
}
