var gulp = require('gulp'),
	sass = require('gulp-ruby-sass'),
	livereload = require('gulp-livereload'),
	express = require('express'),
	path = require('path'),
	app = express();


gulp.task('styles', function(){
	gulp.src('scss/*.scss')
	.pipe(sass())
	.on('error', console.error.bind(console))
	.pipe(gulp.dest('public/css/'))
	.pipe(livereload());
	
});


gulp.task('default', function(){

	app.use(express.static(path.join(__dirname, 'public')));
	app.listen(2000);
	console.log('http://localhost:2000');

	var server = livereload();
	gulp.watch('scss/*.scss',['styles']);

});
