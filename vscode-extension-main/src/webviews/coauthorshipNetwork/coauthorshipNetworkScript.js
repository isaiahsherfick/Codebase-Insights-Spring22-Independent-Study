const vscode = acquireVsCodeApi(); //allows us to use message passing back to the extension for tweaking parameters

// // const svg = d3.select("svg");
// var width = svg.attr("width");
// var height = svg.attr("height");

var totalLinesInCodebase; //an int used to scale circle radii
const MAX_CIRCLE_SIZE = 60; //arbitrary
var totalFilesInCodebase; //an int used to scale line width
const MAX_STROKE_WIDTH = 15; //arbitrary

var originalNodes = [];
var nodes = [];
var originalLinks = [];
var links = [];
var fileToOccurrenceCountMap = new Map();
var maxAuthorCount = 0;
const repelForce = -100;
const linkLength = 200;

let zoom = d3.zoom().on("zoom", handleZoom);

function handleZoom(e) {
  d3.select("#venn").attr("transform", e.transform);
}

function initZoom() {
  d3.select("#venn").call(zoom);
}

var tooltip = d3.select("body").append("div")
  .attr("class", "venntooltip");

var chart = venn.VennDiagram().width(900).height(500);

window.addEventListener("message", (event) => {
  totalLinesInCodebase = event.data.totalLinesInCodebase;
  totalFilesInCodebase = event.data.totalFilesInCodebase;
  nodes = event.data.contributorList;
  initFileToOccurrenceCountMap(event.data.advancedContributors);
  originalNodes = event.data.contributorList;
  links = event.data.links;
  originalLinks = event.data.links;
  var div = d3.select("#venn");
  var sets = event.data.advancedContributors;

  console.log("Your data is here" + sets);

  div.datum(sets).call(chart);
  div.selectAll("path")
    .style("stroke-opacity", 0)
    .style("stroke", "#fff")
    .style("stroke-width", 3);
  
  div.selectAll("path")
    .style("cursor", "pointer")
    .on("mouseover", function(d, i) {
        // sort all the areas relative to the current item
        // venn.sortAreas(div, d.sets);

        // Display a tooltip with the current size
        tooltip.transition().duration(400).style("opacity", .9);
        tooltip.text(d.size + " lines");

        // highlight the current path
        var selection = d3.select(this).transition("tooltip").duration(400);
        selection.select("path")
            .style("fill-opacity", .1)
            .style("stroke-opacity", 1);
    })

    .on("mousemove", function() {
        tooltip.style("left", (d3.pageX) + "px")
               .style("top", (d3.pageY - 28) + "px");
    })

    .on("mouseout", function(d, i) {
        tooltip.transition().duration(400).style("opacity", 0);
        var selection = d3.select(this).transition("tooltip").duration(400);
        selection.select("path")
            .style("fill-opacity", .25)
            .style("stroke-opacity", 0);
    })
    .on("click", function (d) {
      showLinkDetails(d);
    });

    // initZoom();
});

function updateLinks() {
  var u = d3
    .select(".links")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("x1", function (d) {
      return d.source.x;
    })
    .attr("y1", function (d) {
      return d.source.y;
    })
    .attr("x2", function (d) {
      return d.target.x;
    })
    .attr("y2", function (d) {
      return d.target.y;
    })
    .attr("id", function (d) {
      return d.source.email + " " + d.target.email;
    })
    .on("click", function (d) {
      showLinkDetails(d);
    })
    .style("cursor", "pointer")
    .attr("stroke-width", function (d) {
      return (d.strength / totalFilesInCodebase) * MAX_STROKE_WIDTH;
    });
}

function updateNodes() {
  u = d3
    .select(".nodes")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("cx", function (d) {
      return d.x;
    })
    .attr("cy", function (d) {
      return d.y;
    })
    .attr("r", function (d) {
      return (d.knowledgeScore / totalLinesInCodebase) * MAX_CIRCLE_SIZE;
    })
    .attr("id", function (d) {
      return d.email;
    })
    .attr("fill", "red")
    .style("cursor", "pointer")
    .on("click", function (d) {
      showAuthorDetailsFromCircle(d);
    });
  u = d3
    .select(".nodes")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .text(function (d) {
      return d.email;
    })
    .attr("x", function (d) {
      return d.x;
    })
    .attr("y", function (d) {
      return d.y;
    })
    .attr("dy", function (d) {
      return 5;
    })
    .style("cursor", "pointer")
    .on("click", function (d) {
      showAuthorDetailsFromText(d);
    });
}

function ticked() {
  updateNodes();
  updateLinks();
}

function initFileToOccurrenceCountMap(nodes) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].sets.length > 1) {continue;}
    let knownFiles = nodes[i].fileSets;
    for (let j = 0; j < knownFiles.length; j++) {
      let knownFile = knownFiles[j];
      if (!fileToOccurrenceCountMap.has(knownFile)) {
        fileToOccurrenceCountMap.set(knownFile, 1);
      } else {
        let currentCount = fileToOccurrenceCountMap.get(knownFile);
        if (currentCount + 1 > maxAuthorCount) {
          maxAuthorCount = currentCount;
        }
        fileToOccurrenceCountMap.set(knownFile, Number(currentCount) + 1);
      }
    }
  }
}

function getFileColorFromOccurrenceCount(fileName) {
  let color = d3
    .scaleLinear()
    .domain([1, maxAuthorCount])
    .range(["#ff3333", "#6666aa"])
    .interpolate(d3.interpolateHcl);
  let authorCount = fileToOccurrenceCountMap.get(fileName);
  if (authorCount) {
    return color(authorCount);
  } else {
    return color(1);
  }
}

////////////////////////// CONTROL PANEL //////////////////////////

function showLinkDetails(d) {
  // hideFilterButton();
  // console.log("Your d is: " + d.fileSets);
  // id = d.path[0].id;
  // source = id.split(" ")[0];
  // destination = id.split(" ")[1];
  // let sourceData, destinationData;
  // for (let i = 0; i < nodes.length; i++) {
  //   if (nodes[i].email === source) {
  //     sourceData = nodes[i].filesKnown;
  //   } else if (nodes[i].email === destination) {
  //     destinationData = nodes[i].filesKnown;
  //   }
  // }
  // let sharedFiles = [];
  // for (let i = 0; i < sourceData.length; i++) {
  //   for (let j = 0; j < destinationData.length; j++) {
  //     if (sourceData[i] === destinationData[j]) {
  //       sharedFiles.push(sourceData[i]);
  //     }
  //   }
  // }
  let sharedFiles = d.fileSets;
  openNav();
  // showFilterButton();
  let emailH2 = document.getElementById("email");
  if (d.sets.length === 1) {
    emailH2.innerHTML = "Files authored by " + originalNodes[d.sets[0]].email;
  } else {
    emailH2.innerHTML = "Files authored by " + originalNodes[d.sets[0]].email + " and " + originalNodes[d.sets[1]].email;
  }
  let filesList = document.getElementById("filesList");
  let filesListInnerHTMLString = "";
  let map = new Map();
  let keys = Array.from(fileToOccurrenceCountMap.keys()).filter(function (n) {
    return sharedFiles.indexOf(n) > -1;
  });
  console.log("Your fileToOccurrenceCountMap keys: " + fileToOccurrenceCountMap.keys().next());
  console.log("Your fileToOccurrenceCountMap values: " + fileToOccurrenceCountMap.values().next());
  console.log("Your sharedFiles: " + sharedFiles);
  for (let i = 0; i < keys.length; i++) {
    map.set(keys[i], fileToOccurrenceCountMap.get(keys[i]));
  }
  console.log("Your map: " + map);
  let sortedFiles = Array.from(map.entries()).sort((a, b) => a[1] - b[1]);
  console.log("Your sorted files: " + sortedFiles);
  for (let i = 0; i < sortedFiles.length; i++) {
    filesListInnerHTMLString +=
      "<li style='color:" +
      getFileColorFromOccurrenceCount(sortedFiles[i][0]) +
      "'>" +
      sortedFiles[i][0].slice(sortedFiles[i][0].lastIndexOf('/') + 1) +
      ": " +
      sortedFiles[i][1] +
      " author(s)" +
      "</li>";
  }
  filesList.innerHTML = filesListInnerHTMLString;
  
}

function showAuthorDetailsFromCircle(d) {
  let email = d.path[0].id;
  showAuthorDetails(email);
}
function showAuthorDetailsFromText(d) {
  let email = d.path[0].innerHTML;
  showAuthorDetails(email);
}
function showAuthorDetails(email) {
  openNav();
  let emailH2 = document.getElementById("email");
  emailH2.innerHTML = email;
  showFilterButton();
  let data;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].email === email) {
      data = nodes[i].filesKnown;
    }
  }
  let map = new Map();
  let keys = Array.from(fileToOccurrenceCountMap.keys()).filter(function (n) {
    return data.indexOf(n) > -1;
  });
  for (let i = 0; i < keys.length; i++) {
    map.set(keys[i], fileToOccurrenceCountMap.get(keys[i]));
  }
  let sortedFiles = Array.from(map.entries()).sort((a, b) => a[1] - b[1]);
  let filesList = document.getElementById("filesList");
  let filesListInnerHTMLString = "";
  for (let i = 0; i < sortedFiles.length; i++) {
    filesListInnerHTMLString +=
      "<li style='color:" +
      getFileColorFromOccurrenceCount(sortedFiles[i][0]) +
      "'>" +
      sortedFiles[i][0] +
      ": " +
      sortedFiles[i][1] +
      " author(s)" +
      "</li>";
  }
  filesList.innerHTML = filesListInnerHTMLString;
}

function openNav() {
  let controlPanel = document.getElementById("controlPanel");
  if (controlPanel.style.width === "0px" || !controlPanel.style.width) {
    //it's undefined the first time you hit the button, which is a case where we want to set it to 325px
    controlPanel.style.width = "375px";
  } else {
    controlPanel.style.width = "0px";
    controlPanel.style.width = "375px";
  }
}
function closeNav() {
  document.getElementById("controlPanel").style.width = "0";
}
function buttonExample() {
  vscode.postMessage({
    data: "Thanks for pressing that button!",
  });
}

function showFilterButton() {
  let filterButton = d3.select("#filterButton");
  let email = document.getElementById("email").innerHTML;
  filterButton.text("Remove " + email);
  filterButton.on("click", filterAuthor);
}

function hideFilterButton() {
  let filterButton = document.getElementById("filterButton");
  filterButton.innerHTML = "";
}

function clearAllFilters() {
  let clearAllFilters = document.getElementById("clearAllFilters");
  clearAllFilters.innerHTML = "";
  nodes = originalNodes;
  links = originalLinks;
  updateNodes();
  updateLinks();
}

function filterAuthor() {
  let clearAllFilters = document.getElementById("clearAllFilters");
  clearAllFilters.innerHTML = "Restore ignored contributors";
  let email = document.getElementById("email").innerHTML;
  newNodes = [];
  newLinks = [];
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].email !== email) {
      newNodes.push(nodes[i]);
    }
  }
  for (let i = 0; i < links.length; i++) {
    if (links[i].source.email !== email && links[i].target.email !== email) {
      newLinks.push(links[i]);
    }
  }
  nodes = newNodes;
  links = newLinks;
  hideFilterButton();
  let filesKnown = document.getElementById("filesList");
  filesKnown.innerHTML = email + " removed from coauthorship network.";
  updateNodes();
  updateLinks();
}

////////////////////////// END CONTROL PANEL //////////////////////////
