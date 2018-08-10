'use strict'

const gulp = require('gulp')

require('./tasks/build')

gulp.task('default', ['build'])
