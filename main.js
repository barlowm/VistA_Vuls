	// const srcRootPath = "https://raw.githubusercontent.com/OSEHRA/VistA-M/master/";
	const srcRootPath = "./";
	var columnDefs = [
	    {headerName: "Root", field: "GlobalRoot", width:80},
	    {headerName: "Line #", field: "vLines", width:80},
	    {headerName: "Data", field: "lineData"},
	    {headerName: "Notes", field: "notes", editable: true},
	    {headerName: "Ignore", field: "ignore", editable: true, rowGroup:true,
	        cellRenderer: params => {
	        	if (!params.node.allChildrenCount) {	// This is a child node
			        return `<input type='checkbox' ${params.value ? 'checked' : ''} />`;
	        	}
		    }
		},

	    {field: "Package", rowGroup:true, hide:true},
	    {field: "NodeType", rowGroup:true, hide:true},
	    {valueGetter: function(params) {
	    	if (!params.data) {
				return "---";
	    	}
	    	else {
		    	return params.data.Vulnerability + " - " + params.data.vType + " - " + params.data.vValue;
	    	}
	    }, rowGroup:true, hide:true}
	];

	var gridOptions = {
		autoGroupColumnDef: {
			headerName:'Package / Type / Vulnerability / Link to Src',
			rowGroup:true, hide:true,
			valueGetter: function(params) {
				// console.log(params);
				if (params.data) {
					const theName = params.data.Name;
					let nPath = params.data.Path.split("/").splice(-4);
					let nPath2 = nPath.join("/");
					const path = srcRootPath + nPath2;
					return `<a href="${path}" target="_theFile">${theName}</a>`;
				}
				return params.value;
			}
		},
	    columnDefs: columnDefs,
	    rowSelection: 'multiple',
	    animateRows: true,
	    enableRangeSelection: true,
	    groupSelectsChildren: true,
	    enableColResize: true,
	    rowData: null,
	    enableSorting:true,
	    enableFilter:true,
	    onGridReady: function(event) {
	        event.api.sizeColumnsToFit();
	    }
	};

	const addData2Grid = function(gridDiv, dVulnerabilities) {
		gridOptions.api.setRowData(dVulnerabilities);
		gridOptions.api.redrawRows();
		gridOptions.api.sizeColumnsToFit();
	};


	const setupthepage = function() {
		console.log("")
	    let gridDiv = $('#myGrid')[0];
	    const ScanResultsSelectTag = $("#whatScanResults1");
		const theSelectTag = $("#whatVulnerability");

		const VulCount = $("#VulCount");

		let theGrid = "";

			// scanResultsFolders comes from the _ScanResultsFolders file loaded in index.html
		scanResultsFolders.forEach(function(o) {
			if (null != o) {
				let d = o.replace("./", "");
				console.log(`scanResultsFolders - ${o} - ${d}`)
				ScanResultsSelectTag.append(`<option value="${o}">${d}</option>`);
			}
		});

			// VulnerabilityList data comes from file _ScanResultsVulnerabilities file loaded in index.html
		ScanResultsSelectTag.change( function() {
			let scPath = "./_ScanResults/" + this.options[this.options.selectedIndex].value + "/scanComment.txt";

			$("#scanComment").text(`No Scan Comment for: ${this.options[this.options.selectedIndex].text}`);
			$.getScript( scPath, function( data, textStatus, jqxhr) {
				if (data) {
					$("#scanComment").text(`Scan Comment: ${data}`);
				}
			});

			let v = VulnerabilityList[this.options[this.options.selectedIndex].value];
			theSelectTag.empty().append(`<option value="">Select Scan Results</option>`);

			v.forEach(function(o) {
				if (null != o) {
					theSelectTag.append(`<option value="${o.value}">${o.name}</option>`);
				}
			});
			$("#selectVulnerability").removeClass("invisible");
		})



		theSelectTag.change( function() {
			if ("" === theGrid) {
			    theGrid = new agGrid.Grid(gridDiv, gridOptions);
			}
			else {
				gridOptions.api.setRowData([]);
				gridOptions.api.redrawRows();
			}

			let v = this.options[this.options.selectedIndex].value;
			let t = this.options[this.options.selectedIndex].text;
			if (v == "") {
				gridOptions.api.setRowData([]);
				gridOptions.api.redrawRows();
			}
			else {
				console.log("Retrieving data from ", v);
				$.getScript( v, function( data, textStatus, jqxhr) {
					// addData2Grid(gridDiv, data);
					let theData = JSON.parse(data);
					let selVulCount = $("#selVulCount");
					if (0 === theData.length) {
						let sTag = $("#whatVulnerability")[0];
						let sText = sTag.options[sTag.options.selectedIndex].text;
						VulCount.text(`No Potential Vulnerabilities Listed`);
						alert(`No Vulnerabilities found for ${sText}`);
					}
					else {
						VulCount.text(`${theData.length} Potential Vulnerabilities Listed`);
						addData2Grid(gridDiv, theData);
					}
				});
			}
		});
	}

	$(document).ready(function(){
			setupthepage();
	});
