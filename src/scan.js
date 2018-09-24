'use strict'
const fs = require('fs-extra');
const readline = require('linebyline');
const cp = require('child_process');
const moment = require("moment");

const constants = require("./consts.js");
const gfl = require("./getFolderList.js");

let Vulnerability, scanPath;
const scanStart = "Scan_" + moment().format("YYYY_MM_DD_H_m_s");
const destPath = constants.scanResults + "/" + scanStart;

// Array used to store the individual Vulnerability Scan files for use in populating the
// "Select Vulnerability to examine" dropdown.
let VulsArray = [];

// Schema for each individual scan record.
const gridData = {
    "Name":"",
    "Path": "",
    "Package":"",
    "Vulnerability":"",
    "vLines":[],
    "vType":"",
    "vValue":"",
    "GlobalRoot":"",
    "NodeType":"",
    "lineData":""
}
// const sampleGridData = {
//     "Name":"RCDPESR0.m",
//     "Package":"Accounts Receivable",
//     "Vulnerability":"EXECUTE",
//     "vLines":["23"],
//     "vType":"Upper",
//     "vValue":"EXECUTE",
//     "path":"Packages/Accounts Receivable/Routines/RCDPESR0.m",
//     "hasVulnerabilities":"Has Vulnerabilities",
//     "GlobalRoot":"",
//     "NodeType":"Routine",
//     "lineData":""
// }





const scan = function() {

	const pad = function (num, size) {
		var s = "000000000" + num;
		return s.substr(s.length-size);
	};

	const getDestPath = function() {
		return destPath;
	}

	const genGrepOutputPath = function(dest, vul) {
		return `${dest}/VistAVuls-${vul.name}.js`;
	}

	/*
	 * Initialize all the constants for the scanning process
	 */
	const prepAndScan = function(scanComment) {
		return new Promise(function(resolve, reject) {
			if (constants.DevMode) {
				Vulnerability = constants.VulnerabilityDev;
				scanPath = constants.scanPathDev;
				console.log("Running in DEVeloper Mode");
			}
			else {
				Vulnerability = constants.Vulnerability;
				scanPath = constants.scanPath;
				console.log("Running in PRODuction Mode");
			}
			console.log("Scan Path - ", scanPath);
			console.log("Number of Vulnerabilities to scan for - ", Vulnerability.length);

			fs.ensureDir(destPath, function(err, data) {
				if (err) {
					reject(`ERROR attempting to access/create destination path - ${destPath}, ERROR = ${err.code}`);
				}

				if (scanComment) {
					const scanCommentFile = fs.createWriteStream(`${destPath}/scancomment.txt`);
					scanCommentFile.write(`${scanComment}\n`);
				}
				gfl.PromiseGenFolderListFile(constants.scanResults).then(function(result) {
					doScan();
					resolve("Scanning for Vulnerabilities underway...");
				}, function(err) {
					reject(`ERROR attempting to Generate Folder List File - ERROR = ${err.code}`);
				});
			});
		})
	};

	/*
	 *	Parse a line of data from the scan and convert it to a "Vulnerability" object
	 *	Add the vulnerability information passed in to the function to the Vulnerability object
	 *	Returns the parsed Vulnerability object
	 */
	const parseLine2Obj = function(line, Vulnerability) {

		let parsed = gridData;
		let d1 = line.split(":");
		let d2 = d1.splice(0,2);
		let types = d2[0].split("/");
		let tLen = types.length;

		parsed.Path = d2[0];
		parsed.Name = types[tLen-1];
		parsed.Package =  types[tLen-3];
		parsed.Vulnerability = Vulnerability.name;
		parsed.vLines = d2[1];
		parsed.vType = Vulnerability.type;
		parsed.vValue = Vulnerability.value;
		parsed.NodeType = types[tLen-2];
		parsed.GlobalRoot = "";
		parsed.lineData = d1.join(":");

		if ("Globals" === parsed.NodeType) {
			let gLine = parsed.lineData.split("=");
			parsed.GlobalRoot = gLine.shift();
			if (gLine.length > 1) {
				gLine.join("=");
			}
			parsed.lineData = gLine;
		}
		if ("" == parsed.Package || !parsed.Package) {
			console.log(`Package not set - ${parsed.Path} - ${parsed.Name} - [${parsed.Package}] - ${Vulnerability.name} - ${tLen}`);
		}
		return parsed;
	}

		/*
		 * Given a specific vulnerability object (vul)
		 * Start a grep process at the folder specified by the "scanPath" variable
		 * piping the output to the parser which then pipes the parsed data to
		 * an output stream located in the "dest" path specified
		 */
	const ParsePromise = function(vul, scanPath, dest) {
		return new Promise((resolve, reject) => {
			const grepOutputStreamPath = genGrepOutputPath(dest, vul);
			const startTime = moment();
			let lineNo = 1;
			let GlobalsCount = 0;
			let RoutinesCount = 0;

			let spawn = require('child_process').spawn;
			let child = spawn('grep', [ vul.options, vul.value, scanPath ]);

			var grepOutput = fs.createWriteStream(grepOutputStreamPath);
			grepOutput.write("[");

			const rl = readline(child.stdout);
			rl.on('line', function(line) {
				// a "clock" letting the user know the process is still running
				if (0 === lineNo%1000) {
					console.log(`Recording potential vulnerability #${lineNo} of ${vul.name} scan`);
				}

				if (lineNo++ > 1) {
					grepOutput.write(",\n");
				}
				let grepParse = parseLine2Obj(line, vul);
				if ("" == grepParse.GlobalRoot) {
					RoutinesCount++;
				}
				else {
					GlobalsCount++;
				}
				grepOutput.write(JSON.stringify(grepParse, null, 2));
			});
			rl.on('close', function() {
				grepOutput.write("]");
				// Add this vulnerability scan to the VulsArray which is used for the select tag
				VulsArray.push(JSON.parse(`{ "name": "${vul.name} - G=${GlobalsCount} - R=${RoutinesCount} - T=${lineNo-1}", "value": "${grepOutputStreamPath}" }`));

				// How long did this particular scan take
				const endTime = moment();
				let timeDiff = moment.utc(moment(endTime,"DD/MM/YYYY HH:mm:ss").diff(moment(startTime,"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss.SSS");
				console.log(`Found ${pad(lineNo, 6)} potential vulnerabilities for name = ${vul.name} / value = ${vul.value}`);
				resolve(lineNo);
			});
		});
	};


	/*
	 *	Sort the list of Vulnerability Scan files and create the "selectVuls.js" file
	 *	for use in populating the "Select Vulnerability to examine" dropdown.
	 *	The "selectVuls.js" file is included in the index.html file at load time
	 */
	const sortVulList = function() {
		function sortByKey(array, key) {
			return array.sort(function(a, b) {
				var x = a[key]; var y = b[key];
				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			});
		}

		let out = sortByKey(VulsArray, "name");
		const selectVuls = fs.createWriteStream(constants.VulResultsFile, {flags: 'a'});
		selectVuls.write("\n// Do not change anything in this file.\n");
		selectVuls.write("// Content here is auto generated by the scan process\n");
		selectVuls.write(`const ${scanStart} = [\n`);
		let line = 0;
		let buf = "";
		out.forEach(function(x) {
			buf = "";
			if (line++ > 0) {
				buf = ",";
			}
			buf += JSON.stringify(x, null, 2);
			selectVuls.write(buf);
		});

		selectVuls.write("];\n");
	};

	const doScan = function() {
		const startTime = moment();
		const a = [];

		Vulnerability.forEach(function(v) {
			a.push(ParsePromise(v, scanPath, destPath));
		})

		Promise.all(a).then(function(v) {
			let count = 0;
			v.forEach(function(c) {
				count += c;
			});
			const endTime = moment();
			let timeDiff = moment.utc(moment(endTime,"DD/MM/YYYY HH:mm:ss").diff(moment(startTime,"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss.SSS");
			console.log("--------------------------");
			console.log(`Processed ${count} total vulnerabilities scanned in ${timeDiff}`);
			sortVulList();
		});
	}
	return { prepAndScan }
}();


module.exports = scan;
