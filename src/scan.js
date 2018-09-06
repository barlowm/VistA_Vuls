'use strict'
const fs = require('fs');
const readline = require('linebyline');
const cp = require('child_process');
const moment = require("moment");



let VulsArray = [];

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

	const ParsePromise = function(vul, scanPath, dest) {
		return new Promise((resolve, reject) => {
			console.log("Starting -", vul.name);
			const startTime = moment();
			let lineNo = 1;
			let GlobalsCount = 0;
			let RoutinesCount = 0;

			let spawn = require('child_process').spawn;
			let child = spawn('grep', [ vul.options, vul.value, scanPath ]);

			var grepOutput = fs.createWriteStream(`${dest}/VistAVuls-${vul.name}.js`);
			grepOutput.write("[");

			const rl = readline(child.stdout);
			rl.on('line', function(line) {
				if (0 === lineNo%1000) {
					console.log(`Parsing - ${lineNo} of ${vul.name} scan`);
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
				VulsArray.push(JSON.parse(`{ "name": "${vul.name} - G=${GlobalsCount} - R=${RoutinesCount} - T=${lineNo-1}", "value": "./ScanResults/VistAVuls-${vul.name}.js" }`));

				const endTime = moment();
				let timeDiff = moment.utc(moment(endTime,"DD/MM/YYYY HH:mm:ss").diff(moment(startTime,"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss.SSS");
				console.log(`Found ${lineNo} potential vulnerabilities for name = ${vul.name}`);
				resolve(lineNo);
			});
		});
	};

	const sortVulList = function() {
		function sortByKey(array, key) {
			return array.sort(function(a, b) {
				var x = a[key]; var y = b[key];
				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			});
		}

		let out = sortByKey(VulsArray, "name");
		const selectVuls = fs.createWriteStream(`./selectVuls.js`);
		selectVuls.write("const Options = [");
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

		selectVuls.write("]");
	};

	return { ParsePromise, sortVulList }
}();


module.exports = scan;
