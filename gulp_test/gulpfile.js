const gulp = require("gulp");
const sass = require("gulp-sass");
const pleeease = require("gulp-pleeease");
const plumber = require("gulp-plumber");
const uglify = require("gulp-uglify");
const imgMin = require("gulp-imagemin");
const jpgMin = require("imagemin-mozjpeg");
const pngMin = require("imagemin-optipng");
const gifMin = require("imagemin-gifsicle");
const svgMin = require("gulp-svgmin");
const browserSync = require("browser-sync");
const process = require("process");
const notifier = require('node-notifier');
const pug = require('gulp-pug');


// setting
let assets_dir = {
	css: "assets/css/",
	js: "assets/js/",
	img: "assets/img/",
	root: "./assets/"
};
let src_file = {
	scss: "src/scss/**/*.scss",
	js: "src/js/**/*.js",
	img: "src/img/**/*.+(jpg|jpeg|png|gif)",
	svg: "src/img/**/*.svg",
	pug: "src/pug/**/*.pug"
};


// task
// コンパイル失敗通知
const errorHandler = function(error) {
	notifier.notify({
		message: 'しっぱいしたワン',
		title: 'compile error',
		appIcon: '/pug.jpeg'
	},function() {
		console.log(error.message);
	});
};

// pugのコンパイル
function pug_compile(){
	return gulp
		.src(src_file.pug)
		.pipe(plumber({
			errorHandler: errorHandler
		}))
		.pipe(pug({
			pretty: true
		}))
		.pipe(gulp.dest(assets_dir.root));
}
exports.task = pug_compile;

// sassのコンパイル
function sass_compile(){
	return gulp
		.src(src_file.scss)
		.pipe(plumber({
			errorHandler: errorHandler
		}))
		.pipe(sass())
		.pipe(pleeease())
		.pipe(gulp.dest(assets_dir.css));
}
exports.task = sass_compile;

// jsの圧縮
function js_min(){
	return gulp
		.src(src_file.js)
		.pipe(plumber({
			errorHandler: errorHandler
		}))
		.pipe(uglify())
		.pipe(gulp.dest(assets_dir.js));
}
exports.task = js_min;

// 画像の圧縮
function img_min(){
	return gulp
		.src(src_file.img)
		.pipe(plumber({
			errorHandler: errorHandler
		}))
		.pipe(imgMin([
			jpgMin(),
			pngMin(),
			gifMin({
				optimizationLevel: 3
			})
		]))
		.pipe(gulp.dest(assets_dir.img));
}
function svg_min(){
	return gulp
		.src(src_file.svg)
		.pipe(plumber({
			errorHandler: errorHandler
		}))
		.pipe(svgMin())
		.pipe(gulp.dest(assets_dir.img));
}
exports.task = img_min;
exports.task = svg_min; 

// ローカルサーバーの立ち上げ
// startPathに作業中のファイルを指定してからgulp走らせる
function serve(done) {
	browserSync.init({
		// ローカルサーバー
		server: {
			baseDir: assets_dir.root
		},
		port: 3000
		// プロキシ指定
		// server: {
		// 	baseDir: assets_dir.root
		// },
		// proxy: 'http://ibjap-design.yama.com/',
		// Host: 'ibjap-design.yama.com',
		// open: 'external'
	});
	done();
}
exports.task = serve;

// ファイル更新時自動リロード
function reload(done){
	browserSync.reload();
	done();
}
exports.task = reload;
function watch(done){
	gulp.watch(src_file.pug, gulp.series(pug_compile));
	gulp.watch(src_file.scss, gulp.series(sass_compile));
	gulp.watch(src_file.js, gulp.series(js_min));
	gulp.watch(src_file.img, gulp.series(img_min));
	gulp.watch(src_file.svg, gulp.series(svg_min));
	gulp.watch("assets/**/*", gulp.series(reload));
	done();
}
exports.task = watch;

// gulpの停止
function exit(done){
	process.exit(0);
	done();
}
exports.task = exit;

// default
gulp.task("default", gulp.series(serve, watch));