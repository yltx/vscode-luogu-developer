const ColorPalette = {
  'blue-1': '#e0f7ff',
  'blue-2': '#89d1f5',
  'blue-3': '#3498db',
  'blue-4': '#14558f',
  'blue-5': '#052242',
  'green-1': '#d9f0c7',
  'green-2': '#94d66d',
  'green-3': '#52c41a',
  'green-4': '#22700a',
  'green-5': '#072401',
  'purple-1': '#fbedff',
  'purple-2': '#ce8ee8',
  'purple-3': '#9d3dcf',
  'purple-4': '#561982',
  'purple-5': '#1f0736',
  'orange-1': '#ffedb5',
  'orange-2': '#ffce63',
  'orange-3': '#f39c11',
  'orange-4': '#a65b00',
  'orange-5': '#592b00',
  'pink-1': '#fff0f0',
  'pink-2': '#ff9ea3',
  'pink-3': '#fe4c61',
  'pink-4': '#b3243e',
  'pink-5': '#660e24',
  'lapis-1': '#cad5e8',
  'lapis-2': '#728dcf',
  'lapis-3': '#2949b4',
  'lapis-4': '#0e1d69',
  'lapis-5': '#02051c',
  'gold-1': '#fff6ba',
  'gold-2': '#ffe169',
  'gold-3': '#ffc116',
  'gold-4': '#b37700',
  'gold-5': '#663d00',
  'cyan-1': '#b5f5ec',
  'cyan-2': '#5cdbd3',
  'cyan-3': '#13c2c2',
  'cyan-4': '#006d75',
  'cyan-5': '#002329',
  'yellow-1': '#ffffb8',
  'yellow-2': '#fffb8f',
  'yellow-3': '#fadb14',
  'yellow-4': '#ad8b00',
  'yellow-5': '#614700',
  'red-1': '#ffebe6',
  'red-2': '#ffa694',
  'red-3': '#e74c3c',
  'red-4': '#9c1d19',
  'red-5': '#4f080a',
  'grey-1': '#fafafa',
  'grey-2': '#e8e8e8',
  'grey-3': '#bfbfbf',
  'grey-4': '#595959',
  'grey-5': '#262626',
  'lgreen-1': '#dae0d3',
  'lgreen-2': '#aac791',
  'lgreen-3': '#70ad47',
  'lgreen-4': '#34611e',
  'lgreen-5': '#091405'
} as const;

type ColorKey = keyof typeof ColorPalette;
type MapColorsToValues<T> = T extends readonly (infer U)[]
  ? readonly MapColorsToValues<U>[]
  : T extends (infer U)[]
    ? MapColorsToValues<U>[]
    : T extends object
      ? T extends (...args: never[]) => unknown
        ? T
        : {
            readonly [K in keyof T]: K extends 'color'
              ? T[K] extends ColorKey
                ? (typeof ColorPalette)[T[K]]
                : T[K]
              : MapColorsToValues<T[K]>;
          }
      : T;

export function isColorKey(value: unknown): value is ColorKey {
  return typeof value === 'string' && value in ColorPalette;
}

export function mapColorsToValues<T>(obj: T): MapColorsToValues<T> {
  if (obj === null || obj === undefined) return obj as MapColorsToValues<T>;
  if (Array.isArray(obj))
    return obj.map(item => mapColorsToValues(item)) as MapColorsToValues<T>;
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj))
      if (key === 'color' && isColorKey(value))
        result[key] = ColorPalette[value];
      else result[key] = mapColorsToValues(value);
    return result as MapColorsToValues<T>;
  }
  return obj as MapColorsToValues<T>;
}

export function mapConstColorsToValues<T extends Record<string, unknown>>(
  obj: T
): MapColorsToValues<T> {
  return mapColorsToValues(obj);
}

export default ColorPalette;
