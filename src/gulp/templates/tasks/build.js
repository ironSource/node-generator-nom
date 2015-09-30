var gulp = require('gulp')

gulp.task('build', () => {
  return gulp.src('**/*.js')
    .pipe( gulp.dest('dist') )
})
