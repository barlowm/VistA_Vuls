'use strict'
const scan = require("./src/scan.js");

const main = function() {
    console.log("Prep for Scan");
    process.argv.splice(0,2);
    const scanComment = process.argv.join(" ");

    scan.prepAndScan(scanComment).then(function(result) {
	    console.log("Scan running in background");
	    console.log("--------------------------");
    }, function(err) {
	    console.log("Scan Failed - ", err);
    });
}()
