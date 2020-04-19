function convertArrayToCCAAObject(dataArray) {
    var dataObject = {};

    for(var i in dataArray) {
        if (dataArray[i][2] in dataObject) {
            dataObject[dataArray[i][2]].push(
                {'date': new Date(dataArray[i][0]),
                'cod_ine': dataArray[i][1],
                'amount': parseInt(dataArray[i][3])}
            );
        } else {
            dataObject[dataArray[i][2]] = [];
            dataObject[dataArray[i][2]].push(
                {'date': new Date(dataArray[i][0]),
                'cod_ine': dataArray[i][1],
                'amount': parseInt(dataArray[i][3])}
            );
        }
    }

    return dataObject;
}

function drawChart ( dataArray ) {
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 980 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleTime()
      .domain(d3.extent(dataArray, function(d) { return d.date; }))
      .range([ 0, width ]);
    // gridlines in x axis function
    function make_x_gridlines() {		
        return d3.axisBottom(x)
            .ticks(5)
    }
    // add the X gridlines
    svg.append("g")			
    .attr("class", "grid")
    .attr("transform", "translate(0," + height + ")")
    .call(make_x_gridlines()
        .tickSize(-height)
        .tickFormat("")
    );
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(dataArray, function(d) { return +d.amount; })])
      .range([ height, 0 ]);
    // gridlines in y axis function
    function make_y_gridlines() {		
        return d3.axisLeft(y)
            .ticks(5)
    }
    // add the Y gridlines
    svg.append("g")
    .attr("class", "grid")
    .call(make_y_gridlines()
        .tickSize(-width)
        .tickFormat("")
    );
    svg.append("g")
      .call(d3.axisLeft(y));
    
    var chartObject = {
        'xAxis': x,
        'yAxis': y,
        'svgChart': svg
    }
    
    return chartObject;
}

function plotLine(chartObject, dataArray, communityLabel) {
    // Add the line
    chartObject['svgChart'].append("path")
      .datum(dataArray)
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return chartObject['xAxis'](d.date) })
        .y(function(d) { return chartObject['yAxis'](d.amount) })
        )
}

// ref: http://stackoverflow.com/a/1293163/2343
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
        );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
            ){

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push( [] );

        }

        var strMatchedValue;

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp( "\"\"", "g" ),
                "\""
                );

        } else {

            // We found a non-quoted value.
            strMatchedValue = arrMatches[ 3 ];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }

    // Return the parsed data.
    return( arrData );
}

function populateCommunityMenu(dataObject) {
    var ul = document.getElementById("community-list");
    var communities = Object.keys(dataObject);
    communities.forEach(community => {
        var a = document.createElement("a");
        a.setAttribute('href', "#");
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(community));
        li.setAttribute("id", community);
        li.classList.add("community-item");
        a.appendChild(li);
        ul.appendChild(a);
    })
}

function populateIndicatorMenu(indicators) {
    var ul = document.getElementById("indicator-list");
    indicators.forEach(indicator => {
        var a = document.createElement("a");
        a.setAttribute('href', "#");
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(indicator));
        li.setAttribute("id", indicator);
        li.classList.add("indicator-item");
        a.appendChild(li);
        ul.appendChild(a);
    })
}

// Dropdown menus control

//toggle dropdown menu open/close
var indicatorMenuToClose = false;
var communityMenuToClose = false;

function toggleIndicatorMenu(e) {
  e.stopPropagation();
  var btn=this;
  var menu = btn.nextSibling.nextSibling;
  switchIndicatorMenu(menu);
};

function switchIndicatorMenu(menuElement) {
     while(menuElement && menuElement.nodeType != 1) {
        menuElement = menuElement.nextSibling
     }
     if(!menuElement) return;
     if (menuElement.style.display !== 'block') {
         menuElement.style.display = 'block';
         if(indicatorMenuToClose) indicatorMenuToClose.style.display="none";
         indicatorMenuToClose  = menuElement;
     }  else {
         menuElement.style.display = 'none';
         indicatorMenuToClose=false;
     }
   }

function toggleCommunityMenu(e) {
     e.stopPropagation();
     var btn=this;
     var menu = btn.nextSibling.nextSibling;
     switchCommunityMenu(menu);
   };

function switchCommunityMenu(menuElement) {
    while(menuElement && menuElement.nodeType != 1) {
        menuElement = menuElement.nextSibling
     }
     if(!menuElement) return;
     if (menuElement.style.display !== 'block') {
        menuElement.style.display = 'block';
        if(communityMenuToClose) communityMenuToClose.style.display="none";
        communityMenuToClose  = menuElement;
     } else {
         menuElement.style.display = 'none';
         communityMenuToClose=false;
     }
}

function closeIndicatorMenu() {
    listMenuElement = document.getElementById("indicator-list");
    switchIndicatorMenu(listMenuElement);
};

function closeCommunityMenu() {
    listMenuElement = document.getElementById("community-list");
    switchCommunityMenu(listMenuElement);
};

function selectIndicatorDropdownItem(e) {
    switchIndicatorMenu(e.target.parentElement.parentElement);
}

var makeSelectCommunityDropdownItem = function(chartAndDataObject) {
    return function (e) {
        document.getElementById("community-label-id").innerHTML = e.target.id;
        var selectedCommunityData = chartAndDataObject["dataObject"][e.target.id];
        plotLine(chartAndDataObject["chartObject"], selectedCommunityData, e.target.id);
        switchCommunityMenu(e.target.parentElement.parentElement);
    }
}

window.onclick=function(event){
  if (communityMenuToClose) {
    closeCommunityMenu.call(event.target);
  }
  if (indicatorMenuToClose) {
    closeIndicatorMenu.call(event.target);
  }
};

window.onload = function() {
    var casosFileUrl = 'https://raw.githubusercontent.com/datadista/datasets/master/COVID%2019/ccaa_covid19_casos_long.csv';
    Promise.all([
        casosFileUrl
    ].map(function(url) {
        return fetch(url).then(function(response) {
            return response.ok ? response.text() : Promise.reject(response.status);
        }).then(function(text) {
            var casosData = CSVToArray(text);
            delete casosData[0];

            var dataObject = convertArrayToCCAAObject(casosData);
            var communityData = dataObject['Madrid'];
            var chartObject = drawChart( communityData );
            var chartAndDataObject = {
                'dataObject': dataObject,
                'chartObject': chartObject
            };
            var indicators = ['New Cases', 'Deaths'];

            populateCommunityMenu(dataObject);
            populateIndicatorMenu(indicators);
            document.querySelectorAll(".btn-indicator-list").forEach(function(btn){
                btn.addEventListener("click", toggleIndicatorMenu, true);
            });
            document.querySelectorAll(".btn-community-list").forEach(function(btn){
                btn.addEventListener("click", toggleCommunityMenu, true);
            });
            document.querySelectorAll(".community-item").forEach(function(item){
                item.addEventListener("click",
                makeSelectCommunityDropdownItem(chartAndDataObject), true);
            });
            document.querySelectorAll(".indicator-item").forEach(function(item){
                item.addEventListener("click", selectIndicatorDropdownItem, true);
            });
        });
    }))
    .catch(function(err) {
        console.log(err);
    })
}
