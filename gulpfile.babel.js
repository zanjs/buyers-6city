import pkg from './package.json';
import conf from './config.json';
import gulp from 'gulp';
import sass from 'gulp-sass';
import minifycss from 'gulp-minify-css';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import notify from 'gulp-notify';
import saveLicense from 'uglify-save-license';
import autoprefixer from 'gulp-autoprefixer';
import ejs from "gulp-ejs";
import header from 'gulp-header';
import replace from 'gulp-replace';
import imagemin from 'gulp-imagemin';
import px2rem from 'gulp-pxrem';


const day = conf.start;
const title = conf[day].title;
const ID = conf[day].id;
const description = conf[day].description;
const keywords = conf[day].keywords;
const author = conf[day].author;
const version = conf[day].version;
const mincss = conf[day].build.css;
const minjs = conf[day].build.js;
const BuildPath = './build/';


let cssLoadSrc = conf[day].load.css;
let jsLoadSrc = conf[day].load.js;

console.log(jsLoadSrc)

const browserSync = require('browser-sync').create();
const reload = browserSync.reload;



const banner = [
    '/*! ',
    `${title} `,
    `v ${version}  | `,
    `(c) ${new Date()}  ${author}  |`,
    ' <%= pkg.homepage %> ',
    ` ${ID}`,
    ' */',
    '\n'
].join('');


gulp.task('ejs', () => gulp.src(`./${day}/src/templates/index.ejs`)
    .pipe(ejs({
        title: title,
        description: description,
        keywords: keywords,
        mincss: mincss,
        path: BuildPath,
        version: version,
        time: new Date().getTime()
    }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(`./${day}/`))
    .pipe(notify({ message: 'ejs task complete' }))
    .pipe(reload({ stream: true })))



//编译Sass，Autoprefix及缩小化
gulp.task('sass', () => gulp.src(cssLoadSrc)
    // .pipe(plumber())
    // .pipe(sass({ style: 'expanded' }))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['> 1%', 'Firefox <= 20', 'last 10 versions', 'IE 8'],
        cascade: false
    }))
    // .pipe(px2rem({
    //     baseDpr: 2, // base device pixel ratio (default: 2)
    //     threeVersion: false, // whether to generate @1x, @2x and @3x version (default: false)
    //     remVersion: true, // whether to generate rem version (default: true)
    //     remUnit: 75, // rem unit value (default: 75)
    //     remPrecision: 6
    // }))
    .pipe(rename(mincss))
    .pipe(minifycss())
    .pipe(header(banner, { pkg }))
    .pipe(gulp.dest(`./${day}/build/css/`))
    .pipe(reload({ stream: true }))
    .pipe(notify({ message: 'Styles  task complete' })));


gulp.task('scripts', () => gulp.src(jsLoadSrc)
    .pipe(concat('main.js'))
    .pipe(rename(minjs))
    .pipe(uglify())
    .pipe(header(banner, { pkg }))
    .pipe(gulp.dest(`./${day}/build/js/`))
    .pipe(reload({ stream: true }))
    .pipe(notify({ message: 'Scripts task complete' })));

gulp.task('images', () => gulp.src(`./${day}/src/img/*`)
    .pipe(imagemin())
    .pipe(gulp.dest(`./${day}/build/img`)));


gulp.task('html', () => {
    gulp.src(`./${day}/*.html`)
        .pipe(reload({ stream: true }))
});


gulp.task('home', () => gulp.src('./home/scss/main.scss')
    .pipe(sass({ style: 'expanded' }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('./home/css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('./home/css/'))
    .pipe(reload({ stream: true }))
    .pipe(notify({ message: 'home style  task complete' })));


gulp.task('homeHtml', () => {
    gulp.src('./*.html')
        .pipe(reload({ stream: true }))
});



// 静态服务器 + 监听 scss/html 文件
gulp.task('dev', ['sass','scripts'], () => {

    browserSync.init({
        server: `./${day}/`
    });

    // 看守.scss 档
    gulp.watch(`./${day}/src/scss/**/*.scss`, ['sass']);
    gulp.watch(`./${day}/src/scss/*.scss`, ['sass']);
    gulp.watch('./home/scss/*.scss', ['home']);
    // 看守所有.js档

    gulp.watch(`./${day}/*.js`, ['scripts']);
    gulp.watch(`./${day}/src/js/*.js`, ['scripts']);

    // 看守所有.html
    gulp.watch(`./${day}/*.html`).on('change', reload);
    gulp.watch('./*.html').on('change', reload);

    gulp.watch([`./${day}/src/templates/html/html.html`], ['host']);
    gulp.watch([`./${day}/src/templates/*.ejs`, `./${day}/src/templates/html/index.html`], ['ejs']);

});



gulp.task('default', ['dev', 'sass', 'ejs']);