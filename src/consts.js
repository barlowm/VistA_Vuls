const Vulnerability = require("../ListOfVulnerabilities2ScanFor.js");

module.exports = {
	DevMode: true,
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
			"name": "ACCESS",
			"type": "Upper",
			"value": "ACCESS",
			"options": "-nr"
		},
	    {
	        "name": "IP Address",
	        "type": "Regex",
	        "value": "(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])",
	        "options": "-inr"
	    },
		{
			"name": "VERIFY",
			"type": "Upper",
			"value": "VERIFY ",
			"options": "-nr"
		}
	],
	scanPathDev : "../Pack/*",
	scanPath : "../Packages/*",
	scanResults: "./_ScanResults",
	VulResultsFile: "./_ScanResultsVulnerabilities.js",
	scanResultsListFile: "./_ScanResultsFolders.js"
};
