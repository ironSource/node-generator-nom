'use strict'

const gulp = require('gulp')

gulp.task('build', () => {
  return gulp.src('src/*.js')
    .pipe(gulp.dest('dist'))
})
