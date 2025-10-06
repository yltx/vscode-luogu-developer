// @ts-check

import fs from 'fs';
import { resolve } from 'path';
import { webfont } from 'webfont';

/**
 * Read icon metadata from package.json
 */
function readIconData() {
  const pkg = JSON.parse(fs.readFileSync(resolve('package.json'), 'utf8'));
  return /** @type {any} */ (pkg.contributes && pkg.contributes.icons) || {};
}

async function build() {
  console.log('Building icon fonts...');
  try {
    fs.mkdirSync(resolve('dist'), { recursive: true });
  } catch (e) {
    // ignore
  }
  const iconData = readIconData();
  const files = Object.keys(iconData).map(name => `productIcons/${name}.svg`);
  if (files.length === 0) {
    console.log('No icons found in package.json contributes.icons, skipping.');
    return;
  }

  const result = await webfont({
    files,
    formats: ['woff'],
    normalize: true,
    sort: false,
    glyphTransformFn: obj => {
      const ch = iconData[obj.name].default.fontCharacter;
      const code = ch.substring(1);
      const cp = parseInt(code, 16);
      (obj.unicode || (obj.unicode = ['']))[0] = String.fromCharCode(cp);
      return obj;
    }
  });

  if (!result.woff) throw new Error('font generation failed');
  const out = resolve('dist', 'icon.woff');
  fs.writeFileSync(out, new Uint8Array(result.woff));
  console.log('Icon fonts built:', out);
}

build().catch(err => {
  console.error('Failed to build icons:', err);
  process.exit(2);
});
