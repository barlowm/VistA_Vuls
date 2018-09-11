'use strict'
const scan = require("./src/scan.js");

const main = function() {
    console.log("Prep for Scan");
    scan.prepAndScan();
    console.log("Scan Complete");
}()
