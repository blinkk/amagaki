import * as esbuild from 'esbuild';

import {exec} from 'child_process';
import gulp from 'gulp';

const ENTRIES = {
  templates: {
    watch: ['./src/**/*.njk'],
    out: './dist/'
  },
  js: {
    // File location for tsc output.  Based on tsconfig output settings.
    tsc_out: ['./dist/ui/index.js'],
    out: './dist/ui/index.min.js',
    watch: ['./src/**/*.ts'],
  },
};

/**
 * esBuild does not do type checks and can build with type errors so we first run
 * `tsc` and generate a JS file.  esBuild is then run on the outputted JS file.
 *
 * The entry point of tsc compilation is configured in tsconfig `include`.
 */
const runEsBuild = async (prod: boolean) => {
  return new Promise<void>((resolve, reject) => {
    exec('tsc', async (error, stderr) => {
      if (stderr) {
        console.error('Typescript errors');
        console.error(stderr);
        reject();
      } else {
        await esbuild.build({
          entryPoints: ENTRIES.js.tsc_out,
          outfile: ENTRIES.js.out,
          bundle: true,
          platform: 'browser',
          minify: prod,
        });
        resolve();
      }
    });
  });
};

gulp.task('build:js', async () => {
  await runEsBuild(true);
});

gulp.task('watch:js', async cb => {
  await runEsBuild(false);
  gulp.watch(ENTRIES.js.watch, async () => {
    await runEsBuild(false);
    cb();
  });
});

gulp.task('watch:templates', () => {
  return gulp.watch(ENTRIES.templates.watch, gulp.series('build:templates'));
});

gulp.task('build:templates', async () => {
  return gulp.src(ENTRIES.templates.watch)
    .pipe(gulp.dest(ENTRIES.templates.out));
})

gulp.task('build', gulp.parallel('build:js', 'build:templates'));
gulp.task('watch', gulp.parallel('build', 'watch:js', 'watch:templates'));
gulp.task('default', gulp.series('watch'));
