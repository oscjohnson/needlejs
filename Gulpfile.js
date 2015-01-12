var gulp = require('gulp'),
	sass = require('gulp-ruby-sass'),
	livereload = require('gulp-livereload'),
	express = require('express'),
	path = require('path'),
	app = express();
	path = require('path'),
    multer = require('multer'),
    fs = require('fs');

gulp.task('styles', function(){
	gulp.src('scss/*.scss')
	.pipe(sass())
	.on('error', console.error.bind(console))
	.pipe(gulp.dest('public/css/'))
	.pipe(livereload());
	
});


gulp.task('default', function(){

	app.use(express.static(path.join(__dirname, 'public')));
	app.use(multer({dest:'./public/uploads/'}));
	app.listen(2000);

	// Handle file upload
	app.post('/upload', function (req, res) {

        var filename = req.files.file.originalname;
        // res.send('public/index.html');
	    
	    var tempPath = req.files.file.path,
	        targetPath = path.resolve('./uploads/image.png');
			
		var string = encodeURIComponent('uploads/' + filename);


	        fs.rename(tempPath, 'public/uploads/' + filename, function(err) {
	       	    if (err) throw err;
        		res.redirect('/?image=' + string);
	        });

	
	});

	console.log('http://localhost:2000');

	var server = livereload();
	gulp.watch('scss/*.scss',['styles']);

});
