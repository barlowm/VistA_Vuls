'use strict'
const fs = require("fs-extra");
const moment = require("moment");
const scan = require("./src/scan.js");
const constants = require("./src/consts.js");
const gfl = require("./src/getFolderList.js");

const dev = true;


const main = function() {
    const startTime = moment();
    let Vulnerability, scanPath;
    if (dev) {
    	Vulnerability = constants.VulnerabilityDev;
    	scanPath = constants.scanPathDev;
    }
    else {
    	Vulnerability = constants.Vulnerability;
    	scanPath = constants.scanPath;
    }

console.log("List Directories for Scan Results - ", gfl.getDirs("./ScanResults1"));

}()
