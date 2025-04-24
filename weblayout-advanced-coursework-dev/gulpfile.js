const {src, dest, series, watch} = require('gulp')
const concat = require('gulp-concat')
const htmlMin = require('gulp-htmlmin')
const autoprefixes = require("gulp-autoprefixer")
const cleanCss = require("gulp-clean-css")
const image = require('gulp-image')
const svgSprite = require('gulp-svg-sprite')
const sourcemaps = require('gulp-sourcemaps')
const ttf2woff2 = require('gulp-ttf2woff2');
const babel = require('gulp-babel')
const notify = require('gulp-notify')
const del = require('del')
const gulpIf = require('gulp-if')
const fileinclude = require('gulp-include')
const bs = require('browser-sync')
const uglify = require('gulp-uglify-es').default
const browserSync = require('browser-sync').create()




let prod = false

const isProd = (done) =>{
  prod = true;
  done()
}



const clean = () =>{
  return del(['dist'])
}



const fonts = () =>{
 return src('src/fonts/**/*',{encoding:false})
  .pipe(dest('./dist/font'))
}

const include = () => {
  return src(['src/pages/*.html'])
  .pipe(fileinclude({
    includePaths:'src/component'
  }))
  .pipe(dest('src'))
  .pipe(browserSync.stream());
}


const styles = () =>{
  return src('src/styles/**/*.css')
  .pipe(gulpIf(!prod,sourcemaps.init()))
  .pipe(concat('main.css'))
  .pipe(gulpIf(prod,autoprefixes({
    cascade: false,
  })))
  .pipe(gulpIf(prod,cleanCss({
    level: 2
  })))
  .pipe(gulpIf(!prod,sourcemaps.write()))
  .pipe(dest('dist'))
  .pipe(browserSync.stream())
}

const htmlMinfy = () =>{
  return src('src/*.html',)
  .pipe(gulpIf(prod,htmlMin({
    collapseWhitespace: true,
  })))
  .pipe(dest('dist'))
  .pipe(browserSync.stream())
}

const scripts = () =>{
  return src([
    'src/js/**/*.js'
  ])//файлы с которыми мы работем
  .pipe(gulpIf(!prod,sourcemaps.init()))
  .pipe(gulpIf(prod,babel({
    presets:['@babel/env']
  })))
  .pipe(concat('app.js'))// обЪединяем файлы
  .pipe(gulpIf(prod,uglify({
    toplevel: true
  }).on('error', notify.onError())))// в случае ошибки выдаем сообщение
  .pipe(gulpIf(!prod,sourcemaps.write()))
  .pipe(dest('dist')) // где должна будет лежать папка
  .pipe(browserSync.stream())//автоматическая перезагрузка
}

// таск для svg картинки
const svgSprites = () =>{
  return src('src/images/svg/**/*.svg')//файлы с которыми мы работем
  .pipe(svgSprite({
    mode:{
      stack:{
        sprite:'../sprite.svg'
      }
    }
  }))
  .pipe(dest('dist/images')) // где должна будет лежать папка
}

const images = () =>{
  return src(
    'src/images/**/*', {encoding:false})//файлы с которыми мы работем
  .pipe(gulpIf(prod,image()))
  .pipe(dest('dist/images')) // где должна будет лежать папка
}


const watchFiles = () =>{
  browserSync.init({
    server:{
      baseDir: 'dist'
    }
  })
}

watch('src/component/*.html', include)
watch('src/pages/*.html', include)
watch('src/**/*.html', htmlMinfy)
watch('src/styles/**/*.css', styles)
watch('src/images/svg/**/*.svg', svgSprites)
watch('src/fonts/**.ttf', fonts)
watch('src/js/**/*.js',scripts)
watch('src/images/**/*.png',images)

exports.default=fonts

exports.dev = series(clean,include,fonts, htmlMinfy,scripts, styles,images, svgSprites,  watchFiles)
exports.build = series(isProd, clean, include, fonts,  htmlMinfy,scripts, styles, images, svgSprites)
