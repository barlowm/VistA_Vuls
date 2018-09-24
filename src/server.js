const http = require('http');
const fs = require('fs-extra');
const path = require('path');
const qs = require('querystring');

http.createServer(function (request, response) {
	// console.log("---------------------------------------");
	// console.log('request ', request.url);
	// console.log(request.method);
	if ("POST" === request.method) {
// console.log("Posting Data - ----------------------------------\n");
        var body = '';

        request.on('data', function (data) {
            body += data.toString();

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                request.connection.destroy();
        });

        request.on('end', function () {
            var post = qs.parse(body);
            const postLocation = post.location;
            let fileData = "";
            const Data2Write = {
				"Name": post["data[Name]"],
				"Path": post["data[Path]"],
				"Package": post["data[Package]"],
				"Vulnerability": post["data[Vulnerability]"],
				"vLines": post["data[vLines]"],
				"vType": post["data[vType]"],
				"vValue": post["data[vValue]"],
				"GlobalRoot": post["data[GlobalRoot]"],
				"NodeType": post["data[NodeType]"],
				"lineData": post["data[lineData]"],
				"notes": post["data[notes]"]
			};
			// console.log("Reading the data");
			fs.readFile(postLocation, function(err, data) {
				fileData = JSON.parse(data);
				let key1 = Data2Write.Path;
				let key2 = Data2Write.vLines;
				// console.log("We have the data - ", fileData.length);
				fileData.some(function(r) {
					const ck = r.Path === key1 && r.vLines === key2;
					if (ck) {
						r.notes = Data2Write.notes;
						// console.log(r);
					}
					return ck;
				});
				// console.log("We have ALTERED the data - ", fileData.length);

				// console.log("We're ready to write the data");
				var outputData = fs.createWriteStream(postLocation);
				let lineNo = 1;
				outputData.write("[\n");

				fileData.forEach(function(r) {
					if (lineNo++ > 1) {
						// console.log("did you write");
						outputData.write(",\n");
					}
					outputData.write(JSON.stringify(r, null, 2));
					// console.log(r);
				});
				outputData.write("]");
				// console.log('Saved!');
			});
		 	// console.log("Change complete");
        });
// console.log("----------------------------------------");

		response.end('ok');
	}


	else if ("GET" == request.method) {
		let filePath = '.' + request.url;
		let stripPos = filePath.indexOf("?");
		if (filePath == './') {
			filePath = './index.html';
		}
		if (stripPos > 0) {
			filePath = filePath.substring(0, stripPos);
		}

		var extname = String(path.extname(filePath)).toLowerCase();
		var mimeTypes = {
			'.html': 'text/html',
			'.js': 'text/javascript',
			'.css': 'text/css',
			'.json': 'application/json',
			'.png': 'image/png',
			'.jpg': 'image/jpg',
			'.gif': 'image/gif',
			'.wav': 'audio/wav',
			'.mp4': 'video/mp4',
			'.woff': 'application/font-woff',
			'.ttf': 'application/font-ttf',
			'.eot': 'application/vnd.ms-fontobject',
			'.otf': 'application/font-otf',
			'.svg': 'application/image/svg+xml',
			  '.m': 'application/txt'

		};

		// console.log("Extension - ", extname);
		filePath = decodeURI(filePath);
		var contentType = mimeTypes[extname] || 'application/txt';	// 'application/octet-stream';

		fs.readFile(filePath, function(error, content) {
			// console.log("Reading File - ", filePath);
			if (error) {
				// console.log("Reading File ERROR - ", error.code);
				// console.log(error);
				// console.log("---------------------------------------");

				if(error.code == 'ENOENT') {
					fs.readFile('./404.html', function(error, content) {
						response.writeHead(200, { 'Content-Type': contentType });
						response.end(content, 'utf-8');
					});
				}
				else {
					response.writeHead(500);
					response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
					response.end();
				}
			}
			else {
				// console.log("Sending the file - ", contentType);
				response.writeHead(200, { 'Content-Type': contentType });
				response.end(content, 'utf-8');
			}
		});
		}



}).listen(8080);
// console.log('Server running at http://127.0.0.1:8080/');
