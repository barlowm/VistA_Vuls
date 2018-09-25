	// const srcRootPath = "https://raw.githubusercontent.com/OSEHRA/VistA-M/master/";
	const srcRootPath = "./";
	let PostURL = "";
	var columnDefs = [
	    {headerName: "Global Reference", field: "GlobalRoot", width:80},
	    {headerName: "Line #", field: "vLines", width:80},
	    {headerName: "Data", field: "lineData"},
	    {headerName: "Notes", field: "notes", editable: true},
	    {headerName: "Ignore", field: "ignore", editable: true, checkboxSelection:true },

	    {field: "Package", rowGroup:true, hide:true},
	    {field: "NodeType", rowGroup:true, hide:true},
	    {headerName: "Vulnerability Info", valueGetter: function(params) {
	    	if (!params.data) {
				return "---";
	    	}
	    	else {
		    	return params.data.Vulnerability + " - " + params.data.vType + " - " + params.data.vValue;
	    	}
	    }, rowGroup:true, hide:true},

	    {
	    	headerName: "File",
		    rowGroup:true, hide:true,
		    valueGetter: function(params) {
				if (params.data) {
					const theName = params.data.Name;
					let nPath = params.data.Path.split("/").splice(-4);
					let nPath2 = nPath.join("/");
					const path = srcRootPath + nPath2;
					return `${path} - ${theName}`;
					// return `<a href="${path}" target="_theFile">${theName}</a>`;
				}
				return params.value;
			}
		}
	];


	let ignoredRows = [];

	var gridOptions = {
	    columnDefs: columnDefs,
	    rowSelection: 'multiple',
	    animateRows: true,
	    enableRangeSelection: true,
	    groupSelectsChildren: true,
	    enableColResize: true,
	    rowData: null,
	    enableSorting:true,
	    enableFilter:true,


		isRowSelectable: function(rowNode) {
			return rowNode.data;
		},

		sideBar: 'columns',
		defaultColDef: {
			// allow every column to be aggregated
			enableValue: true,
			// allow every column to be grouped
			enableRowGroup: true,
			// allow every column to be pivoted
			enablePivot: true
		},

		autoGroupColumnDef: {
			headerName:'Package / Type / Vulnerability / Link to Src',
			rowGroup:true, hide:true,
			valueGetter: function(params) {
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

		onSelectionChanged: function(event) {
			var nodes = event.api.getSelectedNodes();
			var rows = event.api.getSelectedRows();
			rows.forEach(function(r) {
				if (!r.ignored) {
					// Process the request to ignore this row
					r.ignored = true;
					ignoredRows.push(`${r.name}-${r.vlines}`);
				}
			});
			ignoredRows.forEach(function(r) {
				// search through all the ignoredRows to find any that are in the ignoredRows list
				// that are NOT in the selected rows.
/**
var x = ["a","b","c","t"];
var y = ["d","a","t","e","g"];

myArray = y.filter( function( el ) {
  return x.indexOf( el ) < 0;
});
 **/


			}
			console.log(`selection changed, ${nodes.length} rows selected`);
		},


	    onCellValueChanged: function(event, a, b, c) {
	    	// event.data.notes;
	    	let theRecord = event.data;
	    	let thePostData = { location: PostURL, data: theRecord };
	    	$.post(location.href, thePostData, function() {
				console.log("Post has been processed and returned");
	    	})
	    },

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
					theSelectTag.append(`<option value="${o.value}" vul="${o.vulsearch}">${o.name}</option>`);
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
			const selected = this.options[this.options.selectedIndex];
			let v = selected.value;
			let t = selected.text;
			let vs = selected.getAttribute("vul");
			if (v == "") {
				gridOptions.api.setRowData([]);
				gridOptions.api.redrawRows();
			}
			else {
				console.log("Retrieving data from ", v);
				PostURL = v;
				$.getScript( v, function( data, textStatus, jqxhr) {
					let theData = JSON.parse(data);
					let sTag = $("#whatVulnerability")[0];
					let sText = sTag.options[sTag.options.selectedIndex].getAttribute("vul");
					if (0 === theData.length) {
						VulCount.text(`No Potential Vulnerabilities identified for ${sText}`);
					}
					else {
						VulCount.text(`${theData.length} Potential Vulnerabilities identified for ${sText}`);
						addData2Grid(gridDiv, theData);
					}
				});
			}
		});
	}

	$(document).ready(function(){
			setupthepage();
	});
