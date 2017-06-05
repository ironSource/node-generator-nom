const gulp = require('gulp')
    , path = require('path')
    , glob = require('glob')

glob.sync('tasks/*.js').forEach(file => {
  require( path.resolve(file) )
})

gulp.task('default', ['build'])
