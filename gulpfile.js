var gulp = require('gulp'),
    es = require('event-stream'),
    sass = require('gulp-sass'),
    prefix = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    svgmin = require('gulp-svgmin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat');

gulp.task('styles', function() {
    var normalize = gulp.src('bower_components/normalize-css/normalize.css');
    var custom = gulp.src('src/css/**/*.scss').pipe(sass({
        style: 'expanded',
        errLogToConsole: true
    }));
    
    return es.concat(normalize, custom)
        .pipe(concat('fuerte.css'))
        .pipe(prefix())
        .pipe(gulp.dest('public/stylesheets'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(gulp.dest('public/stylesheets'));
});

gulp.task('fonts', function() {
    gulp.src('src/fonts/**/*.*').pipe(gulp.dest('public/fonts'));
    gulp.src('bower_components/bootstrap-sass-official/assets/fonts/bootstrap/**/*.*').pipe(gulp.dest('public/fonts/bootstrap'));
});

gulp.task('watch', function() {
    var log = function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    };
    gulp.watch('src/css/**/*.scss', ['styles']).on('change', function(event) {
        log(event);
    });
});