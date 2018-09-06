const Vulnerability = require("../ListOfVulnerabilities2ScanFor.js");

module.exports = {
	Vulnerability : Vulnerability,
	VulnerabilityDev : [
		{
	        "name": "Access",
	        "type": "Upper",
	        "value": "Access",
	        "options": "-inr"
	    },
	    {
	        "name": "Execute",
	        "type": "Upper",
	        "value": "Execute",
	        "options": "-inr"
	    }
	],
	scanPathDev : "../Pack/*",
	scanPath : "../Packages/*"
};

// Live Data/Folder
// Vulnerability  require("./ListOfVulnerabilities2ScanFor.js");
// const scanPath = "../Packages/*";

