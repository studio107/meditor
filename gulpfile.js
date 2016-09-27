var gulp = require('gulp'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    webpack = require('webpack-stream'),
    csso = require('gulp-csso'),
    sass = require('gulp-sass'),
    clean = require('gulp-clean'),
    livereload = require('gulp-livereload');

var version = '1.0.0';

var dst = {
    editor: 'dist/js',
    js: 'dist/js',
    css: 'dist/css',
    images: 'dist/images',
    fonts: 'dist/fonts',
    vendors: './vendors'
};

var paths = {
    editor: [
        "js/utils.js",
        "js/core.js",
        "js/grid.js",
        "js/engine.js",
        "js/editor.js",
        "js/block.js",
        "js/plugins/text/text.js",
        "js/plugins/video.js",
        "js/plugins/lost.js",
        "js/plugins/space.js",
        "js/plugins/image.js",
        "js/plugins/map/map.js",

        // 'js/**/*.js'
    ],
    js: [
        'bower_components/jquery/dist/jquery.js',
        'bower_components/underscore/underscore.js'
    ],
    images: 'images/**/*',
    css: 'scss/**/*.scss'
};

gulp.task('ckeditor', function () {
    return gulp.src('bower_components/ckeditor/**')
        .pipe(gulp.dest('vendors/ckeditor'));
});

gulp.task('js', function () {
    return gulp.src(paths.js)
        // .pipe(webpack(require('./webpack.config.js')))
        .pipe(concat(version + '.all.js'))
        .pipe(gulp.dest(dst.js));
});

gulp.task('editor', function () {
    return gulp.src(paths.editor)
        .pipe(babel())
        .pipe(concat(version + '.editor.js'))
        .pipe(gulp.dest(dst.js));
});

gulp.task('css', function () {
    return gulp.src(paths.css)
        .pipe(sass({
            includePaths: [
                'bower_components/mindy-sass'
            ]
        }))
        .pipe(csso({

        }))
        .pipe(concat(version + '.all.css'))
        .pipe(gulp.dest(dst.css));
});

gulp.task('watch', function () {
    livereload.listen();

    gulp.watch(paths.editor, ['editor']);
    gulp.watch(paths.js, ['js']);
    gulp.watch(paths.images, ['images']);
    gulp.watch(paths.css, ['css']);
});

gulp.task('clean', function () {
    return gulp.src(['dist/*'], {
        read: false
    }).pipe(clean());
});

gulp.task('default', ['clean'], function () {
    return gulp.start('css', 'js');
});
