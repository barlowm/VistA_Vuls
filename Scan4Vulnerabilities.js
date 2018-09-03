'use strict'
const fs = require('fs');
const readline = require('linebyline');
const cp = require('child_process');
const moment = require("moment");


// Test Data/Folder
// const Vulnerability =   [{
//         "name": "Access",
//         "type": "Upper",
//         "value": "Access",
//         "options": "-inr"
//     },{
//         "name": "Execute",
//         "type": "Upper",
//         "value": "Execute",
//         "options": "-inr"
//     }];
const scanPath = "../Pack/*";

// Live Data/Folder
const Vulnerability = require("./ListOfVulnerabilities2ScanFor.js");
// const scanPath = "../Packages/*";

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


const scan4Vuls = function() {
    const parseLine2Obj = function(line, Vulnerability) {

        let parsed = gridData;
        let d1 = line.split(":");
        let d2 = d1.splice(0,2);
        let types = parsed.Path.split("/");
        let tLen = types.length;
        parsed.Path = d2[0];
        parsed.Name = parsed.Path.split("/")[parsed.Path.split("/").length-1];
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
        return parsed;
    }

    const ParsePromise = function(vul) {
        return new Promise((resolve, reject) => {
            console.log("Starting -", vul.name);
            const startTime = moment();
            let lineNo = 1;

            let spawn = require('child_process').spawn;
            let child = spawn('grep', [ vul.options, vul.value, scanPath ]);

            var grepOutput = fs.createWriteStream(`./ScanResults/VistAVuls-${vul.name}.js`);
            grepOutput.write("[");

            const rl = readline(child.stdout);
            rl.on('line', function(line) {
                if (0 === lineNo%1000) {
                    console.log(`Parsing - ${lineNo} of ${vul.name} scan`);
                }

                if (lineNo++ > 1) {
                    grepOutput.write(",\n");
                }
                grepOutput.write(JSON.stringify(parseLine2Obj(line, vul), null, 2));
            });
            rl.on('close', function() {
                grepOutput.write("]");
                const endTime = moment();
                let timeDiff = moment.utc(moment(endTime,"DD/MM/YYYY HH:mm:ss").diff(moment(startTime,"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss.SSS");
                console.log(`Found ${lineNo} potential vulnerabilities for name = ${vul.name}`);
                resolve(lineNo);
            });
        });
    };

    return { ParsePromise }
};

module.exports = scan4Vuls();


const main = function() {
    const scanner = scan4Vuls();
    const startTime = moment();
    console.log(`Scanning VistA for ${Vulnerability.length} different vulnerabilities`);
    const selectVuls = fs.createWriteStream(`./selectVuls.js`);

    const a = [];
    selectVuls.write("const Options = [");
    let numVuls = 0;
    Vulnerability.forEach(function(v) {
        if (numVuls++ > 0) {
            selectVuls.write(", ");
        }
        selectVuls.write(`{ "name": "${v.name}", "value": "./ScanResults/VistAVuls-${v.name}.js" }`);
        a.push(scanner.ParsePromise(v));
    })
    selectVuls.write("];");

    Promise.all(a).then(function(v) {
        let count = 0;
        v.forEach(function(c) {
            count += c;
        });
        const endTime = moment();
        let timeDiff = moment.utc(moment(endTime,"DD/MM/YYYY HH:mm:ss").diff(moment(startTime,"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss.SSS");
        console.log(`Processed ${count} total vulnerabilities scanned in ${timeDiff}`);
    })
}()