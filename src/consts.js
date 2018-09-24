const Vulnerability = require("../ListOfVulnerabilities2ScanFor.js");

// Set DevMode to true to use full package source and the "ListOfVulnerabilities2ScanFor.js" for the list of vulnerabilities
module.exports = {
	DevMode: false,
	Vulnerability : Vulnerability,
	VulnerabilityDev0 : [
	    {
	        "name": "IP Address",
	        "type": "Regex",
	        "value": "(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])",
	        "options": "-inr"
	    }
	],
	VulnerabilityDev : [
		{
			"name": "AUTHENTICATE",
			"type": "Upper",
			"value": "AUTHENTICATE",
			"options": "-inr"
		},
		{
			"name": "Execute",
			"type": "Upper",
			"value": "EXECUTE",
			"options": "-nr"
		}
	],
	scanPathDev : "./Pack/*",
	scanPath : "../Packages/*",
	scanResults: "./_ScanResults",
	VulResultsFile: "./_ScanResultsVulnerabilities.js",
	scanResultsListFile: "./_ScanResultsFolders.js"
};
