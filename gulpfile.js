"use strict";

// loading plugins
const
    gulp = require('gulp'),
    sass = require("gulp-sass"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    cssnano = require("cssnano"),
    del = require("del"),
    browsersync = require("browser-sync").create(),
    plumber = require("gulp-plumber"),
    gulpIf = require("gulp-if"),
    uglify = require("gulp-uglify-es").default,
    newer = require("gulp-newer"),
    imagemin = require("gulp-imagemin"),
    useref = require("gulp-useref"),
    cache = require('gulp-cache');

const path = [
    // Scripts
    {
        lib: 'src/js/lib',
        nodeJq: 'node_modules/jquery/dist/jquery.min.js',
        nodeBs: 'node_modules/bootstrap/dist/js/bootstrap.min.js',
        nodePop: 'node_modules/popper.js/dist/popper.min.js',
        dist: 'dist/js'
    },
    // Scss
    {
        app: 'src/scss/app/**/*.scss',
        node: 'node_modules/bootstrap/scss/bootstrap.scss',
        include: 'src/scss/**/*.scss'
    },
    // Css
    {
        node: 'node_modules/bootstrap/dist/css/bootstrap.min.css',
        app: 'src/css/',
        frame: 'src/css/framework'
    },
    // Html
    {
        src: 'src/**/*.html',
        dist: 'dist'
    },
    // Favicon
    {
        src: 'src/favicon.ico',
        dist: 'dist'
    },
    // Images
    {
        src: 'src/media/img/**/*.+(png|jpg|gif|svg|ico)',
        dist: 'dist/media/img'
    }
]
const
    pathJs = path[0],
    pathScss = path[1],
    pathCss = path[2],
    pathHtml = path[3],
    pathFav = path[4],
    pathImg = path[5];

// Scss -> Css
const buildScss = () => {
    return gulp
        .src(pathScss.include)
        .pipe(newer(pathCss.app))
        .pipe(plumber())
        .pipe(
            sass({
                outputStyle: 'expanded'
            })
        )
        .pipe(gulp.dest(pathCss.app))
        .pipe(browsersync.stream());
}
// Framework Css
const buildCss = () => {
    return gulp
        .src(pathCss.node)
        .pipe(newer(pathCss.frame))
        .pipe(gulp.dest(pathCss.frame));
}
// Scripts
const buildJs = () => {
    return gulp
        .src([
            pathJs.nodeJq,
            pathJs.nodeBs,
            pathJs.nodePop
        ])
        .pipe(plumber())
        .pipe(newer(pathJs.lib))
        .pipe(gulp.dest(pathJs.lib));
}
// Optimize Images
const buildImg = () => {
    return gulp
        .src(pathImg.src)
        .pipe(newer(pathImg.dist))
        .pipe(cache(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.jpegtran({
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo({
                plugins: [{
                    removeViewBox: false,
                    collapseGroups: true
                }]
            })
        ])))
        .pipe(gulp.dest(pathImg.dist));
};
// Favicon
const favicon = () => {
    return gulp
        .src(pathFav.src)
        .pipe(gulp.dest(pathFav.dist));
}
// Minify
const minify = () => {
    return gulp
        .src(pathHtml.src)
        .pipe(useref())
        .pipe(gulpIf("*.js", uglify()))
        .pipe(gulpIf('*.css', postcss([autoprefixer(), cssnano()])))
        .pipe(gulp.dest(pathHtml.dist))
};
// BrowserSync
const browserSync = (done) => {
    browsersync.init({
        server: {
            baseDir: 'src'
        },
        port: 3000
    });
    done();
};
// Browser Reload
const browserSyncReload = () => {
    browsersync.reload();
};
// Clean file Build
const clean = () => {
    return del(['dist']);
};
// Watch files
const watchFiles = () => {
    gulp.watch("src/scss/**/*", buildScss);
    gulp.watch("src/**/*.html").on("change", browserSyncReload);
    gulp.watch("src/media/img/**/*", buildImg);
};
// define complex tasks
const build = gulp.series(clean, gulp.parallel(buildImg, favicon), minify);
const watch = gulp.series(gulp.parallel(buildScss, buildJs), buildCss, gulp.parallel(watchFiles, browserSync));
// task exports
exports.buildScss = buildScss;
exports.buildCss = buildCss;
exports.buildImg = buildImg;
exports.buildJs = buildJs;
exports.clean = clean;
exports.browserSync = browserSync;
exports.build = build;
exports.watch = watch;