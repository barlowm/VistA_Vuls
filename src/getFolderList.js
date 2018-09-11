const klaw = require('klaw');
const through2 = require('through2');
const fs = require('fs-extra');
// const { lstatSync, readdirSync } = require('fs-extra');
// const fs = require('fs-extra');
const { join } = require('path');


const url = require('url');

// const getDirectories = srcPath => fs.readdirSync(srcPath).filter(file => fs.statSync(path.join(srcPath, file)).isDirectory());



const getFolderList = function() {

	const isDirectory = function(source) {
		return lstatSync(source).isDirectory();
	}

	const mapFnc = function(src, name) {
		return join(src, name).filter(isDirectory)
	}

	const getDirs = function(src) {
		console.log("getDirs - ", src);
		// fs.stat(src, function(err, stats) {
		// 	if (err) {
		// 		console.log("Error for ", src, " - ", err);
		// 		return [];
		// 	}
		// });
		// return fs.readdirSync(src, function(err, stats) {
		// 	if (err) {
		// 		console.log("Error for ", src);
		// 		return [];
		// 	}
		// });

		try {
			return readdirSync(src).map(name => join(src, name)).filter(isDirectory);
		}
		catch (err) {
			console.log("Error for ", src);
			return [];
		}
	}


	const getDirs3 = function(src) {
		console.log("getDirs - ", src);
		fs.readdirSync(src, function(err, data) {
			if (err) {
				console.log("Error - ");
			}
			else {
				console.log(data);
			}
		})
		// return readdirSync(src).map(name => join(src, name)).filter(isDirectory)
	}



	const getDirs2 = function(src) {
		console.log("getDirs - ", src);
		fs.stat(src, function(err, stats) {
			if (err) {
				console.log("Error for ", src, " - ", err);
			}
			else {
				console.log("retrieve all dirs in this folder");
			}

		});
	}


	const excludeDirFilter = through2.obj(function (item, enc, next) {
		if (!item.stats.isDirectory()) {
			this.push(item)
		}
		next();
	})

	const items = [] // files, directories, symlinks, etc
	const getFolderList = function(rootFolder, scan) {
		fs.ensureDir(rootFolder, function(err) {
			fs.readdir(rootFolder, function(err, items) {
			    console.log(items);
			    if (items) {
				    for (var i=0; i<items.length; i++) {
				        console.log(items[i]);
				    }
				    scan();
			    }
			});
		})

		// klaw(rootFolder)
		// 	.pipe(excludeDirFilter)
		// 	.on('data', function(item) {
		// 		console.log("Item - ", item);
		// 		items.push(item.path)
		// 	})
		// 	.on('end', () => console.dir(items));	   // => [ ... array of files without directories]
	};


	const PromiseGenFolderListFile = function(rootFolder) {
		console.log("PromiseGenFolderListFile - Start")
		return fs.readdir(rootFolder)
			.then(function(files) {
				let relURLs = [];
				const root = process.cwd();
				files.forEach(function(f) {
					const resolvedURL = "./" + url.resolve("", f.replace(root, ""));
					relURLs.push(resolvedURL);
				})

				// Gen the folder list file here with writestreams
				console.log("PromiseGenFolderListFile - Done")
				return "PromiseGenFolderListFile - " + relURLs;
			})
			.catch(function(err) {
				console.log("We got an error - ", err.code);
				return ("PromiseGenFolderListFile - It Broke :(");
			});
	};

	const PromiseEnsureDir = function(destPath) {
		console.log("PromiseEnsureDir - Start")
		return fs.ensureDir(destPath)
		.then(function(data) {
			console.log("PromiseEnsureDir - Done")
			return;
		}, function(err) {
			console.log("We got an error - ", err.code);
			return ("PromiseEnsureDir - It Broke :(");
		});
	}




	return { getFolderList, getDirs, getDirs2, getDirs3, PromiseGenFolderListFile, PromiseEnsureDir }
}();

module.exports = getFolderList;
