var fs = require('fs');
var del = require('del');
var gulp = require('gulp');
var gutil = require('gulp-util');
var replace = require('gulp-replace');
var runSequence = require('run-sequence');
var convertEncoding = require('gulp-convert-encoding');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var browserSync = require('browser-sync').create();
var vinylFtp = require('vinyl-ftp');
var config = JSON.parse(fs.readFileSync('./config.json'));
if (fs.existsSync('.cache')) {
    var cacheContent = fs.readFileSync('.cache', 'utf8');
}
var paths = {
  css: 'user/theme/' + config.theme + '/media/css'
};
var globs = {
  html: [
    '**/*.html',
    '!node_modules/**/*.html'
  ],
  sass: [
    'user/theme/' + config.theme + '/media/sass/**/*.scss'
  ],
  js: [
    'user/theme/' + config.theme + '/media/js/**/*.js'
  ],
  upload: [
    '**/*.html',
    '!node_modules/**/*.html',
    'user/theme/' + config.theme + '/media/css/**/*.css',
    'user/theme/' + config.theme + '/media/sass/**/*.scss',
    'user/theme/' + config.theme + '/media/js/**/*.js',
    'user/theme/' + config.theme + '/media/img/**/*.jpg',
    'user/theme/' + config.theme + '/media/img/**/*.gif',
    'user/theme/' + config.theme + '/media/img/**/*.png',
    'user/media/' + config.theme + '/media/img/**/*.jpg',
    'user/media/' + config.theme + '/media/img/**/*.gif',
    'user/media/' + config.theme + '/media/img/**/*.png'
  ]
};


gulp.task('rename:theme', function() {
  var themeFolder = 'user/theme/THEME-NAME';

  if (fs.existsSync('user/theme/' + cacheContent)) {
    themeOrigin = 'user/theme/' + cacheContent;
  } else {
    themeOrigin = themeFolder;
  }

  return gulp.src(themeOrigin + '/**')
    .pipe(gulp.dest('user/theme/' + config.theme));
});

gulp.task('rename:media', function() {
  var mediaFolder = 'user/media/THEME-NAME';

  if (fs.existsSync('user/media/' + cacheContent)) {
    mediaOrigin = 'user/media/' + cacheContent;
  } else {
    mediaOrigin = mediaFolder;
  }

  return gulp.src(mediaOrigin + '/**')
    .pipe(gulp.dest('user/media/' + config.theme));
});

gulp.task('replace:config', function() {
  var configOrigin = 'user/theme/' + config.theme + '/config.php';

  return gulp.src(configOrigin, {
      base: './'
    })
    .pipe(replace(/(title\' => \')(.*?)(?=\')/,
      '$1' + config.name))
    .pipe(replace(/(desc\' => \')(.*?)(?=\')/,
      '$1' + config.name + 'のテーマです。'))
    .pipe(convertEncoding({
      to: 'utf-8'
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('replace:path', function() {
  var pathOrigin = globs.html.concat(globs.sass, globs.js);

  return gulp.src(pathOrigin, {
      base: './'
    })
    .pipe(replace(/(user\/theme\/)(.*?)(?=\/)/g,
      '$1' + config.theme))
    .pipe(replace(/(user\/media\/)(.*?)(?=\/)/g,
      '$1' + config.theme))
    .pipe(convertEncoding({
      to: 'utf-8'
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('clean', function() {
  var removeList = ['user/theme/THEME-NAME/**', 'user/media/THEME-NAME/**'],
    oldTheme = 'user/theme/' + cacheContent;

  if (fs.existsSync(oldTheme) && cacheContent != config.theme) {
    removeList.push(oldTheme + '/**');
  }

  return del(removeList);
});

gulp.task('cache', function() {
  return fs.writeFileSync('.cache', config.theme);
});

gulp.task('init', function(cb) {
  runSequence(
    ['rename:theme', 'rename:media'],
    ['replace:config', 'replace:path'],
    'clean',
    'cache',
    cb);
});

gulp.task('sass', function() {
  return gulp.src(globs.sass)
    .pipe(sassGlob())
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(gulp.dest(paths.css))
    .pipe(browserSync.stream());
});

gulp.task('serve', ['sass'], function() {
  browserSync.init({
    server: {
      baseDir: "."
    }
  });
});

gulp.task('deploy', ['sass'], function() {
  var conn = vinylFtp.create({
    host: config.host,
    user: config.user,
    password: config.password,
    parallel: 8,
    log: gutil.log
  });
  return gulp.src(globs.upload, {
      base: '.',
      buffer: false
    })
    .pipe(conn.newer(config.root))
    .pipe(conn.dest(config.root))
});

gulp.task('watch', ['sass', 'serve'], function() {
  gulp.watch(globs.sass, ['sass']);
  gulp.watch(globs.js).on('change', browserSync.reload);
  gulp.watch(globs.html).on('change', browserSync.reload);
});

gulp.task('watch:deploy', ['sass', 'serve', 'deploy'], function() {
  gulp.watch(globs.sass, ['sass']);
  gulp.watch(globs.js).on('change', browserSync.reload);
  gulp.watch(globs.html).on('change', browserSync.reload);
  gulp.watch(globs.upload, ['deploy']);
});

gulp.task('default', ['watch']);
