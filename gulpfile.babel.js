const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const fs = require('fs');
const nunjucks = require('nunjucks');
const exec = require('child_process').exec;

gulp.task('js', () => {
  browserify({ entries: ['./src/index.js'] })
    .bundle()
    .pipe(source("bundle.js"))
    .pipe(gulp.dest('./dest'));
});

gulp.task('css', () => {
  return gulp.src('./node_modules/mermaid/dist/mermaid.css')
    .pipe(gulp.dest('./dest'));
});

gulp.task('html', (cb) => {
  fs.readFile('./graph.mmd', 'utf8', (err, data) => {
    if (err) return cb(err);
    const html = nunjucks.render('./src/index.html', { mermaid: data });
    fs.writeFile('./dest/index.html', html, 'utf8', cb);
  });
});

gulp.task('png', (cb) => {
  exec('`npm bin`/mermaid graph.mmd', (err) => {
    if (err) return cb(err);
    exec('mv graph.mmd.png graph.png', cb);
  });
});

gulp.task('serve', ['js', 'css', 'html', 'png'], () => {
  browserSync.init({
    browser: 'google-chrome',
    server: {
      baseDir: './dest/',
      index: 'index.html'
    }
  });
  gulp.watch('graph.mmd', ['html', 'png']);
  gulp.watch('./dest/index.html').on('change', browserSync.reload);
});
