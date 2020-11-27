const gulp = require('gulp');
const series = gulp.series;
const less = require('gulp-less');
const download = require('gulp-download-files');
const _nunjucks = require('nunjucks');
const nunjucks = require('gulp-nunjucks');
const data = require('gulp-data');
const fs = require('fs');

function copyStatic(cb) {
	// static files to place at root
	gulp.src('./src/res/static/*').pipe(gulp.dest('./dist/'));
	// static files not to place at root
	gulp.src('./src/res/img/*').pipe(gulp.dest('./dist/res/img/'));
	gulp.src('./src/res/js/*').pipe(gulp.dest('./dist/res/js/'));
	gulp.src('./src/res/style/*.css').pipe(gulp.dest('./dist/res/style/'));
	cb();
}

function compileStyles(cb) {
	gulp.src('./src/res/style/*.less').pipe(less({
		paths: [ `${__dirname}/src/res/style/`, `${__dirname}/dist/res/style/` ]
	})).pipe(gulp.dest('./dist/res/style/'));
	cb();
}

function compilePages(cb) {
	const env = new _nunjucks.Environment(new _nunjucks.FileSystemLoader('./src'), {trimBlocks: true, lstripBlocks: true});

	gulp.src('./src/pages/*.html')
		.pipe(data(({path}) => ({ path: path.replace(__dirname, '').replace('/src/pages', '').replace(/\/?index\.html/, '').replace('.html', '').replace(/^\//, '') })))
		.pipe(nunjucks.compile({}, { env }))
		.pipe(gulp.dest('./dist/'));
	gulp.src(['./src/pages/blog/*.html', '!./src/pages/blog/post_template.html', '!./src/pages/blog/index.html'])
		.pipe(data(({path}) => ({ path: path.replace(__dirname, '').replace('/src/pages', '').replace(/\/?index\.html/, '').replace('.html', '').replace(/^\//, '') })))
		.pipe(nunjucks.compile({}, { env }))
		.pipe(gulp.dest('./dist/blog/'));
	gulp.src('./src/pages/blog/index.html')
		.pipe(data(({path}) => ({ path: 'blog', posts: fs.readdirSync(`${__dirname}/src/pages/blog/`).filter(x => x != 'index.html' && x != 'post_template.html')})))
		.pipe(nunjucks.compile({}, {env: new _nunjucks.Environment(new _nunjucks.FileSystemLoader(['./src', './src/pages/blog']), {trimBlocks: true, lstripBlocks: true})}))
		.pipe(gulp.dest('./dist/blog/'));
	cb();
}

exports.default = series(copyStatic, compileStyles, compilePages);
