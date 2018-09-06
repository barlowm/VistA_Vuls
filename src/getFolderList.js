const klaw = require('klaw')
const through2 = require('through2')
const { lstatSync, readdirSync } = require('fs-extra')
const { join } = require('path')


// const getDirectories = srcPath => fs.readdirSync(srcPath).filter(file => fs.statSync(path.join(srcPath, file)).isDirectory());



const getFolderList = function() {

	const isDirectory = function(source) {
		return lstatSync(source).isDirectory();
	}

	const getDirs = function(src) {
		return readdirSync(src).map(name => join(src, name)).filter(isDirectory)
	}

	const excludeDirFilter = through2.obj(function (item, enc, next) {
		if (!item.stats.isDirectory()) {
			this.push(item)
		}
		next();
	})

	const items = [] // files, directories, symlinks, etc
	const getFolderList = function() {
		klaw('./')
			.pipe(excludeDirFilter)
			.on('data', item => items.push(item.path))
			.on('end', () => console.dir(items));	   // => [ ... array of files without directories]
	};
	return { getFolderList, getDirs }
}();

module.exports = getFolderList;
