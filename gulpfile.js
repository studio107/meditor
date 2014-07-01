var gulp = require('gulp');

var concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    minifyCSS = require('gulp-minify-css'),
    sass = require('gulp-sass'),
    changed = require('gulp-changed'),
    clean = require('gulp-clean'),
    cache = require('gulp-cached'),
    livereload = require('gulp-livereload');

var version = '1.0.0';

var minifyOpts = {

};

var imagesOpts = {
    optimizationLevel: 5,
    progressive: true,
    interlaced: true
};

var sassOpts = {
    includePaths: [
        '/Library/Ruby/Gems/2.0.0/gems/compass-0.12.6/frameworks/compass/stylesheets'
    ]
};

var dst = {
    js: 'dist/js',
    css: 'dist/css',
    images: 'dist/images',
    sass: './css'
};

var paths = {
    js: [
        'src/js/**/*.js'
    ],
    images: 'images/**/*',
    sass: 'scss/**/*.scss',
    css: [
        'css/**/*.css',
        'vendor/font-awesome/css/font-awesome.min.css',
        'fonts/fonts/style.css'
    ]
};

gulp.task('fonts', function() {
    return gulp.src('vendor/font-awesome/fonts/*')
        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('js', function() {
    return gulp.src(paths.js)
    // .pipe(uglify())
    .pipe(concat(version + '.all.js'))
        .pipe(gulp.dest(dst.js));
});

gulp.task('images', function() {
    return gulp.src(paths.images)
        .pipe(changed(dst.images))
        .pipe(cache('imagemin', imagesOpts))
        .pipe(gulp.dest(dst.images));
});

gulp.task('sass', function() {
    return gulp.src(paths.sass)
        .pipe(sass(sassOpts))
        .pipe(gulp.dest(dst.sass));
});

gulp.task('css', ['sass'], function() {
    return gulp.src(paths.css)
        .pipe(gulp.dest(dst.sass))
        .pipe(minifyCSS(minifyOpts))
        .pipe(concat(version + '.all.css'))
        .pipe(gulp.dest(dst.css));
});

// Rerun the task when a file changes
gulp.task('watch', ['default'], function() {
    var server = livereload(),
        liveReloadCallback = function(file) {
            setTimeout(function() {
                server.changed(file.path);
            }, 300);
        };

    gulp.watch(paths.js, ['js']).on('change', liveReloadCallback);
    gulp.watch(paths.images, ['images']);
    gulp.watch(paths.sass, ['css']).on('change', liveReloadCallback);
});

// Clean
gulp.task('clean', function() {
    return gulp.src(['dist/*'], {
        read: false
    }).pipe(clean());
});

gulp.task('default', ['clean'], function() {
    return gulp.start('js', 'css', 'fonts', 'images');
});
