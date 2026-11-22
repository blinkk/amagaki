import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '..');

function copyNjkFiles(srcDir, destDir) {
  for (const entry of fs.readdirSync(srcDir, {withFileTypes: true})) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyNjkFiles(srcPath, destPath);
    } else if (entry.name.endsWith('.njk')) {
      fs.mkdirSync(path.dirname(destPath), {recursive: true});
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyShoelaceIcons() {
  const icons = ['chevron-right.svg', 'check-lg.svg'];
  const destDir = path.join(pkgRoot, 'dist/ui/assets');
  fs.mkdirSync(destDir, {recursive: true});
  for (const icon of icons) {
    const candidates = [
      path.join(pkgRoot, 'node_modules/@shoelace-style/shoelace/dist/assets/icons', icon),
      path.join(pkgRoot, '../../node_modules/@shoelace-style/shoelace/dist/assets/icons', icon),
    ];
    const src = candidates.find(p => fs.existsSync(p));
    if (!src) {
      throw new Error(`Could not find Shoelace icon: ${icon}`);
    }
    fs.copyFileSync(src, path.join(destDir, icon));
  }
}

async function main() {
  await esbuild.build({
    entryPoints: [path.join(pkgRoot, 'src/ui/page-builder-ui.ts')],
    outfile: path.join(pkgRoot, 'dist/ui/page-builder-ui.min.js'),
    bundle: true,
    platform: 'browser',
    minify: true,
  });
  copyNjkFiles(path.join(pkgRoot, 'src'), path.join(pkgRoot, 'dist'));
  copyShoelaceIcons();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
