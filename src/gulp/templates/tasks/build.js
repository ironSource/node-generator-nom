<% if (esnext) { -%>
const gulp = require('gulp')

gulp.task('build', () => {
  return gulp.src('**/*.js')
    .pipe( gulp.dest('dist') )
})
<% } else { -%>
var gulp = require('gulp')

gulp.task('build', function() {
  return gulp.src('**/*.js')
    .pipe( gulp.dest('dist') )
})
<% } -%>
