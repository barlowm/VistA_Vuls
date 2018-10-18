Vulnerabilities = function() {
	console.log("Building list of vulnerabilities");
	const vArray =
		[
			{ "name": "First", "type": "string", "value": "FIRST", "options": "-inr" }
		];
	console.log(`There are ${vArray.length} vulnerabilities`);
	return vArray;
};

module.exports = Vulnerabilities();
