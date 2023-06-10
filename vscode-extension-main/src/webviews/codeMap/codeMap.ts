import path = require("path");
import * as vscode from "vscode";
import * as mockCodeMap from "../../api/mockCodeMap";
import { codeMapWebviewPanel } from "../webviewFactory";
import * as api from "../../api/api";
import * as config from "../../config/config";

export function codemapHTML(args: Map<string, vscode.Uri>): string {
  const d3Uri = args.get("d3");
  const cssUri = args.get("css");
  const codeMapScriptUri = args.get("codeMapScript");
  const controlPanelScript = args.get("controlPanel");
  const radarChartScript = args.get("radarChart");

  let width = 1400;
  let height = 750;
  let files = mockCodeMap.mockCodeMapGETRequest(1, ".java");
  let gitUrl = config.getGitUrl();
  console.log(gitUrl);

  codeMapWebviewPanel?.webview.postMessage({command:"gitHubUrl", data:gitUrl});
  //Request entire codebase data
  api.getCodeMapData().then((responseData) => {
    //Send a message to our webview with Codebase data.
    if (codeMapWebviewPanel) {
      codeMapWebviewPanel.webview.postMessage({command:"mapData", data:responseData});
    } else {
      console.error("codeMapWebviewPanel was undefined");
    }
  });

  return `
    <!DOCTYPE HTML>
    <HTML>
        <head>
            <meta charset="UTF-8" lang="en"/>
            <link rel="stylesheet" type="text/css" href="${cssUri}"/>
            <script src="${d3Uri}"></script>
        </head>
        <body>
              <a class="openPanel2" onclick="openPanel2()">Open Control Panel</a>
            <svg id="codeMap" width="1200" height="900"></svg>
            <div id="controlPanel" class="sidepanel">
              <a class="closebtn" onclick="closeNav()">&times;</a>
              <div class="radarChart"></div>
              <div id="fileDetailsBlock">
                <h3 id="fileName"/>
                <h4 id="filePathHeader">File Path</h4><p id="filePath"/>
                <h4 id="fileAuthorsHeader">File Authors</h4><p id="fileAuthors"/>
              </div>
              <button class="controlbtn" >Send Feedback</button>
            </div>
            <div id="controlPanel2" class="sidepanel">
              <a class="closebtn" onclick="closeNav2()">&times;</a>
              <div class="autocomplete">
                <input id="searchBox" class="searchBox" type="text" value="" name="searchBox" placeholder="Search for a file"/>
              </div>
              <div id="metricSelection">
              <p> Which metric do you want to view on the heat map?</p>
              <ul>
                <li>
                  <a class="heatOption" id="overallHeatButton" onclick="selectOverallHeat()">Overall Heat (default)</a>
                </li>
                <li>
                  <a class="heatOption" id="commitsHeatButton" onclick="selectCommitsHeat()">Recent Commit Frequency</a>
                </li>
                <li>
                  <a class="heatOption" id="authorsHeatButton" onclick="selectAuthorsHeat()">Number of Authors</a>
                </li>
                <!--li>
                  <a class="heatOption" id="cyclomaticComplexityHeatButton" onclick="selectOverallHeat()">Cyclomatic complexity (currently unavailable)</a>
                </li-->
                <li>
                  <a class="heatOption" id="buildFailureScoreHeatButton" onclick="selectBuildFailureScoreHeat()">Appearance in Build Failure Stack Traces</a>
                </li>
                <li>
                  <a class="heatOption" id="degreeOfCouplingHeatButton" onclick="selectDegreeOfCouplingHeat()">Degree of Coupling</a>
                </li>
              </ul>
              </div>
            </div>
        </body>
        <script src="${controlPanelScript}"></script>
        <script src="${radarChartScript}"></script>
        <script src="${codeMapScriptUri}"></script>
    </HTML>
    `;
}