var currentHeatMetric = "overallHeat";
var data;
window.addEventListener("message", (event) => {
  // console.log("Data type", event);
  switch (event.data.command) {
    case "gitHubUrl":
      gitHubUrl = event.data.data;
      break;
    case "mapData":
      data = event.data.data;
  }
  initCodeMap();
});

function clearSvg() {
  d3.select("svg").selectAll('*').remove();
}

function initCodeMap() {
  var color = d3
    .scaleLinear()
    .domain([1, 10])
    .range(["#0000BB", "#BB0000"])
    .interpolate(d3.interpolateRgb);

  clearSvg();
  var svg = d3.select("svg"),
    margin = 100,
    diameter = +svg.attr("width") * 0.8,
    g = svg
      .append("g")
      .attr(
        "transform",
        "translate(" + diameter / 2 + "," + diameter / 2 + ")"
      );
  function handleZoom(e) {
    g.attr("transform", e.transform);
  }
  let zoom2 = d3.zoom().on("zoom", handleZoom);
  d3.select("svg").call(zoom2);

  var pack = d3
    .pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);

  var root = d3
    .hierarchy(data, (c) => {
      return c.fileTreeNodeList;
    })
    .sum(function (d) {
      return d.value ? d.value : 500;
    })
    .sort(function (a, b) {
      return b.value - a.value;
    });

  var focus = root,
    nodes = pack(root).descendants(),
    view;

  var circle = g
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("class", function (d) {
      return d.parent
        ? d.children
          ? "node"
          : "node node--leaf"
        : "node node--root";
    })
    .style("fill", function (d) {
      if (d.children) {
        return "#222222";
      }
      let heatVal;
      switch (currentHeatMetric) {
        case "overallHeat":
          heatVal = d.data.latestHeatObject.overallHeat;
          break;
        case "authors":
          heatVal = d.data.latestHeatObject.numberOfAuthorsHeat;
          break;
        case "commits":
          heatVal = d.data.latestHeatObject.numberOfCommitsHeat;
          break;
        case "degreeOfCoupling":
          heatVal = d.data.latestHeatObject.degreeOfCoupling;
          break;
        case "buildFailureScore":
          heatVal = d.data.latestHeatObject.buildFailureScoreHeat;
          break;
        default:
          heatVal = d.data.latestHeatObject.overallHeat;
          console.log(
            "Unsupported heat metric. Defaulting to overall heat display."
          );
      }
      return color(heatVal);
    })
    .on("click", function (event, d) {
      if (!d.children) {
        fileClicked = d;
        var origDat = [];
        var dat = [];
        for (let i = 0; i < 5; i++) {
          dat[i] = {};
          dat[i].order = i;
        }
        dat[0].value = d.data.latestHeatObject.fileSizeHeat;
        dat[1].value = d.data.latestHeatObject.numberOfCommitsHeat;
        dat[2].value = d.data.latestHeatObject.numberOfAuthorsHeat;
        dat[3].value = d.data.latestHeatObject.degreeOfCouplingHeat;
        if (d.data.latestHeatObject.buildFailureScoreHeat > -1) {
          dat[4].value = d.data.latestHeatObject.buildFailureScoreHeat;
        }
        else { //change default value from -1 to 0 because otherwise the chart's point slips away
          dat[4].value = 0;
        }

        origDat = dat;
        RadarChart.draw(".radarChart", dat);

        openNav();
        d3.select("#fileName").text(d.data.filename);
        d3.select("#filePath").text(d.data.path);
        d3.select("#fileAuthors").text(d.data.uniqueAuthors.toString());
      } else if (focus !== d) {
        zoom(d);
        event.stopPropagation();
      } else {
        zoom(root);
        event.stopPropagation();
      }
    })
    .on("mouseover", function (d) {
      //   console.log("mouseover", d);
    });

  var text = g
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("class", "label")
    .style("fill-opacity", function (d) {
      return d.parent === root ? 1 : 0;
    })
    .style("display", function (d) {
      return d.parent === root ? "inline" : "none";
    })
    .text(function (d) {
      return d.children ? d.data.path : ""; //d.data.filename;
    });

  var node = g.selectAll("circle,text");

  zoomTo([root.x, root.y, root.r * 2 + margin]);

  function zoom(d) {
    focus = d;

    var transition = d3
      .transition()
      .duration(d.altKey ? 7500 : 750)
      .tween("zoom", function (d) {
        var i = d3.interpolate(view, [focus.x, focus.y, focus.r * 2 + margin]);
        return function (t) {
          zoomTo(i(t));
        };
      });

    transition
      .selectAll("text")
      .filter(function (d) {
        if (d && d.parent) {
          return d.parent === focus || this.style.display === "inline";
        }
      })
      .style("fill-opacity", function (d) {
        if (d && d.parent) {
          return d.parent === focus ? 1 : 0;
        }
      })
      .on("start", function (d) {
        if (d && d.parent && d.parent === focus) {
          this.style.display = "inline";
        }
      })
      .on("end", function (d) {
        if (d && d.parent && d.parent !== focus) {
          this.style.display = "none";
        }
      });
  }

  function zoomTo(v) {
    var k = diameter / v[2];
    view = v;
    node.attr("transform", function (d) {
      return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
    });
    circle.attr("r", function (d) {
      return d.r * k;
    });
  }

  //Stuff for the control panel
  function openNav() {
    let controlPanel = document.getElementById("controlPanel");
    if (controlPanel.style.width === "0px" || !controlPanel.style.width) {
      //it's undefined the first time you hit the button, which is a case where we want to set it to 250px
      controlPanel.style.width = "350px";
      //   } else {
      // controlPanel.style.width = "0px";
    }
  }

  function closeNav() {
    document.getElementById("controlPanel").style.width = "0";
  }

  //
  //
  //

  // Modified https://github.com/azole/d3-radar-chart-draggable

  var RadarChart = {
    draw: function (id, d, options) {
      var cfg = {
        radius: 6,
        w: 300,
        h: 300,
        factor: 1,
        factorLegend: 0.85,
        levels: 4,
        maxValue: 10,
        radians: 2 * Math.PI,
        opacityArea: 0.5,
        color: d3.rgb("#659CEF"),
      };
      if ("undefined" !== typeof options) {
        for (var i in options) {
          if ("undefined" !== typeof options[i]) {
            cfg[i] = options[i];
          }
        }
      }

      function copyData(src) {
        dst = [];
        for (key in src) {
          dst[key] = src[key];
        }
        return dst;
      }
      // var dCopy = [];
      // dCopy = copyData(d);

      cfg.maxValue = Math.max(
        cfg.maxValue,
        d3.max(
          d.map(function (o) {
            return o.value;
          })
        )
      );
      var allAxis = d.map(function (i, j) {
        // console.log("Mapping allAxis",i, j);
        return i.axis;
      });
      var total = allAxis.length;
      var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);

      d3.select(id).select("svg").remove();
      var g = d3
        .select(id)
        .append("svg")
        .attr("width", cfg.w)
        .attr("height", cfg.h)
        .append("g");

      var tooltip;

      drawSpiderFrame();
      // drawRadarFrame();
      //Wrapper for the grid & axes
      var maxAxisValues = [];
      drawAxis();
      var dataValues = [];
      reCalculatePoints();

      var areagg = initPolygon();
      drawPoly();

      drawnode();

      function drawSpiderFrame() {
        for (var j = 0; j < cfg.levels; j++) {
          var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
          g.selectAll(".levels")
            .data(allAxis)
            .enter()
            .append("svg:line")
            .attr("x1", function (d, i) {
              return (
                levelFactor *
                (1 - cfg.factor * Math.sin((i * cfg.radians) / total))
              );
            })
            .attr("y1", function (d, i) {
              return (
                levelFactor *
                (1 - cfg.factor * Math.cos((i * cfg.radians) / total))
              );
            })
            .attr("x2", function (d, i) {
              return (
                levelFactor *
                (1 - cfg.factor * Math.sin(((i + 1) * cfg.radians) / total))
              );
            })
            .attr("y2", function (d, i) {
              return (
                levelFactor *
                (1 - cfg.factor * Math.cos(((i + 1) * cfg.radians) / total))
              );
            })
            .attr("class", "line")
            .style("stroke", "grey")
            .style("stroke-width", "0.5px")
            .attr(
              "transform",
              "translate(" +
                (cfg.w / 2 - levelFactor) +
                ", " +
                (cfg.h / 2 - levelFactor) +
                ")"
            );
        }
      }

      function sendDataToBackend(currentVal) {
        var dataToSend = {
          metricNameToWeightMap: {
            FILE_SIZE:
              currentVal[0].value -
              fileClicked.data.latestHeatObject.fileSizeHeat,
            NUM_OF_COMMITS:
              currentVal[1].value -
              fileClicked.data.latestHeatObject.numberOfCommitsHeat,
            NUM_OF_AUTHORS:
              currentVal[2].value -
              fileClicked.data.latestHeatObject.numberOfAuthorsHeat,
            DEGREE_OF_COUPLING:
              currentVal[3].value -
              fileClicked.data.latestHeatObject.degreeOfCouplingHeat,
            COMMIT_RATIO:
              currentVal[4].value -
              fileClicked.data.latestHeatObject.buildFailureScoreHeat,
            CYCLOMATIC_COMPLEXITY: 0,
          },
          fileName: fileClicked.data.filename, //new
          commitHash: "", //new
          gitHubUrl: gitHubUrl,
        };

        console.log("Button pressed, sending data to backend", dataToSend);
        //Make API call(s)
        vscode.postMessage({
          command: "submitHeatValueFeedback",
          data: dataToSend,
        });
      }

      d3.select(".controlbtn").on("click", function (e) {
        sendDataToBackend(d);
      });
      function drawRadarFrame() {
        for (var j = 0; j < cfg.levels; j++) {
          g.selectAll(".levels")
            .data(allAxis)
            .enter()
            .append("svg:circle")
            .attr("cx", function (d, i) {
              return cfg.w / 2;
            })
            .attr("cy", function (d, i) {
              return cfg.h / 2;
            })
            .attr("r", function (d, i) {
              return 37.5 * i;
            })
            .attr("class", "circle")
            .style("stroke", "grey")
            .style("stroke-width", "0.5px")
            .style("fill-opacity", "0.05")
            .style("fill", "#CDCDCD");
        }
      }

      function drawAxis() {
        var axis = g
          .selectAll(".axis")
          .data(allAxis)
          .enter()
          .append("g")
          .attr("class", "axis");

        var axisValues = [
          "File Size",
          "# of Commits",
          "# of Authors",
          "Degree of Coupling",
          "# of Build Failures",
        ];

        axis
          .append("line")
          .attr("x1", cfg.w / 2)
          .attr("y1", cfg.h / 2)
          .attr("x2", function (j, i) {
            maxAxisValues[i] = {
              x:
                (cfg.w / 2) *
                (1 - cfg.factor * Math.sin((i * cfg.radians) / total)),
              y: 0,
            };
            return maxAxisValues[i].x;
          })
          .attr("y2", function (j, i) {
            maxAxisValues[i].y =
              (cfg.h / 2) *
              (1 - cfg.factor * Math.cos((i * cfg.radians) / total));
            return maxAxisValues[i].y;
          })
          .attr("class", "line")
          .style("stroke", "grey")
          .style("stroke-width", "1px");

        axis
          .append("text")
          .attr("class", "legend")
          .text(function (d, i) {
            return axisValues[i];
          })
          .style("font-family", "sans-serif")
          .style("font-size", "10px")
          .attr("x", function (d, i) {
            return (
              (cfg.w / 2) *
                (1 - cfg.factorLegend * Math.sin((i * cfg.radians) / total)) -
              20 * Math.sin((i * cfg.radians) / total)
            );
          })
          .attr("y", function (d, i) {
            return (
              (cfg.h / 2) * (1 - Math.cos((i * cfg.radians) / total)) +
              20 * Math.cos((i * cfg.radians) / total)
            );
          });
      }

      function reCalculatePoints() {
        g.selectAll(".nodes").data(d, function (j, i) {
          dataValues[i] = [
            (cfg.w / 2) *
              (1 -
                (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) *
                  cfg.factor *
                  Math.sin((i * cfg.radians) / total)),
            (cfg.h / 2) *
              (1 -
                (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) *
                  cfg.factor *
                  Math.cos((i * cfg.radians) / total)),
          ];
        });
        dataValues[d[0].length] = dataValues[0];
      }

      function initPolygon() {
        return g
          .selectAll("area")
          .data([dataValues])
          .enter()
          .append("polygon")
          .attr("class", "radar-chart-serie0")
          .style("stroke-width", "2px")
          .style("stroke", cfg.color)
          .on("mouseover", function (d) {
            z = "polygon." + d3.select(this).attr("class");
            g.selectAll("polygon").transition(200).style("fill-opacity", 0.1);
            g.selectAll(z).transition(200).style("fill-opacity", 0.7);
          })
          .on("mouseout", function () {
            g.selectAll("polygon")
              .transition(200)
              .style("fill-opacity", cfg.opacityArea);
          })
          .style("fill", function (j, i) {
            return cfg.color;
          })
          .style("fill-opacity", cfg.opacityArea);
      }

      function drawPoly() {
        areagg.attr("points", function (de) {
          var str = "";
          for (var pti = 0; pti < de.length; pti++) {
            str = str + de[pti][0] + "," + de[pti][1] + " ";
          }
          return str;
        });
      }

      tooltip = g
        .append("text")
        .style("opacity", 0)
        .style("font-family", "sans-serif")
        .style("font-size", 13);

      function drawnode() {
        g.selectAll(".nodes")
          .data(d)
          .enter()
          .append("svg:circle")
          .attr("class", "radar-chart-serie0")
          .attr("r", cfg.radius)
          .attr("alt", function (j) {
            return Math.max(j.value, 0);
          })
          .attr("cx", function (j, i) {
            return (
              (cfg.w / 2) *
              (1 -
                (Math.max(j.value, 0) / cfg.maxValue) *
                  cfg.factor *
                  Math.sin((i * cfg.radians) / total))
            );
          })
          .attr("cy", function (j, i) {
            return (
              (cfg.h / 2) *
              (1 -
                (Math.max(j.value, 0) / cfg.maxValue) *
                  cfg.factor *
                  Math.cos((i * cfg.radians) / total))
            );
          })
          .attr("data-id", function (j) {
            return j.axis;
          })
          .style("fill", cfg.color)
          .style("fill-opacity", 0.9)
          .on("mouseover", function (d) {
            newX = parseFloat(d3.select(this).attr("cx")) - 10;
            newY = parseFloat(d3.select(this).attr("cy")) - 5;
            tooltip
              .attr("x", newX)
              .attr("y", newY)
              .text(d.value)
              //   .transition(20)
              .style("opacity", 1);
            z = "polygon." + d3.select(this).attr("class");
            g.selectAll("polygon").transition(200).style("fill-opacity", 0.1);
            g.selectAll(z).transition(200).style("fill-opacity", 0.7);
          })
          .on("mouseout", function () {
            //   console.log("MouseOUT", d);
            // if (JSON.stringify(d) === JSON.stringify(dCopy)) {
            //   //   console.log(d, dCopy);
            //   // console.log("This is the data:", d);
            //   //   console.log("Same stuff");
            // } else {
            //   dCopy = copyData(d);
            // }
            tooltip
              // .transition(20)
              .style("opacity", 0);
            g.selectAll("polygon")
              .transition(20)
              .style("fill-opacity", cfg.opacityArea);
          })
          .call(d3.drag().on("drag", move)) // for drag & drop
          .on("dragleave", function (d) {
            console.log("Drag Ended:", d);
          })
          .append("svg:title")
          .text(function (j) {
            return Math.max(j.value, 0);
          });
      }
      function move(dobj, i) {
        // this.parentNode.appendChild(this);
        var dragTarget = d3.select(this);
        // console.log(maxAxisValues);

        // i = dobj.sub
        var oldData = dragTarget.data()[0];

        var oldX = parseFloat(dragTarget.attr("cx")) - cfg.w / 2;
        var oldY = cfg.h / 2 - parseFloat(dragTarget.attr("cy"));
        var newY = 0,
          newX = 0,
          newValue = 0;
        var maxX = maxAxisValues[i.order].x - cfg.w / 2;
        var maxY = cfg.h / 2 - maxAxisValues[i.order].y;

        if (oldX === 0) {
          newY = oldY - dobj.dy;

          if (Math.abs(newY) > Math.abs(maxY)) {
            newY = maxY;
          }
          newValue = (newY / oldY) * oldData.value;
        } else {
          var slope = oldY / oldX;
          newX = dobj.dx + parseFloat(dragTarget.attr("cx")) - cfg.w / 2;

          if (Math.abs(newX) > Math.abs(maxX)) {
            newX = maxX;
          }
          newY = newX * slope;

          var ratio = newX / oldX;
          newValue = ratio * oldData.value;
        }

        dragTarget
          .attr("cx", function () {
            return newX + cfg.w / 2;
          })
          .attr("cy", function () {
            return cfg.h / 2 - newY;
          });

        d[oldData.order].value = newValue;
        reCalculatePoints();
        drawPoly();
      }
    },
  };
}
function changeCurrentHeatMetric(newHeatMetric) {
  currentHeatMetric = newHeatMetric;
}
function selectOverallHeat() {
  changeCurrentHeatMetric("overallHeat");
  initCodeMap();
  console.log("overall");
}
function selectCommitsHeat() {
  changeCurrentHeatMetric("commits");
  initCodeMap();
  console.log("commits");
}
function selectAuthorsHeat() {
  changeCurrentHeatMetric("authors");
  initCodeMap();
  console.log("authors");
}
function selectCyclomaticComplexityHeat() {
  changeCurrentHeatMetric("cyclomaticComplexity");
  initCodeMap();
  console.log("cyclomatic");
}
function selectBuildFailureScoreHeat() {
  changeCurrentHeatMetric("buildFailureScore");
  initCodeMap();
  console.log("buildFailureScore");
}
function selectDegreeOfCouplingHeat() {
  changeCurrentHeatMetric("degreeOfCoupling");
  initCodeMap();
  console.log("degreeOfCoupling");
}
