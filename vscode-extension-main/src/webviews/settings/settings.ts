import * as vscode from "vscode";
import * as config from "../../config/config";

export function settingsHTML(args: Map<string, vscode.Uri>): string {
  const githubActionsLogoUri = args.get("githubActionsLogo");
  const jenkinsLogoUri = args.get("jenkinsLogo");
  const noCILogoUri = args.get("noCILogo");
  const cssUri = args.get("css");
  const scriptUri = args.get("script");
  let currentGitRepo = config.getGitUrl();
  let branchName = config.getBranchName();
  let jenkinsUrl = config.getJobUrl();
  let jenkinsUsername = config.getCiUsername();
  let jenkinsApiKey = config.getApiKey();
  let axiosUrl = config.getAxiosUrl();
  let personalAccessToken = config.getPersonalAccessToken();

  return `
    <!DOCTYPE HTML>
    <HTML>
        <head>
            <meta charset="UTF-8" lang="en"/>
            <link rel="stylesheet" type="text/css" href="${cssUri}"/>
        </head>
        <body>
            <div class="page">
                <h1> Settings </h1>

                <div class="row">
                    <h2>GitHub Repository</h2>
                    <table>
                        <tr>
                            <td>
                                GitHub Repository URL
                            </td>
                            <td>
                                <input type="text" id="inputGitUrl" name="inputGitUrl" placeholder="URL" value="${currentGitRepo}" class="inputTextField">
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Branch Name
                            </td>
                            <td>
                            <input type="text" id="inputBranchName" name="inputGitUrl" placeholder="Optional" value="${branchName}" class="inputTextField">
                            </td>
                        </tr>
                    </table>
                </div>
                
                
                <br></br>
                <h2>Which Continuous Integration Tool Do You Use?</h2>
                <table maxWidth="100%">
                    <tr>
                        <td class="tdLogo">
                            <img id="imgChooseGitHubActions" class="innerDivToCenter"
                                src="${githubActionsLogoUri}"
                            />
                        </td>
                        <td class="tdLogo">
                            <img id="imgChooseJenkins" class="innerDivToCenter"
                                src="${jenkinsLogoUri}"
                            />
                        </td>
                        <td class="tdLogo">
                            <img id="imgChooseNoCI" class="innerDivToCenter"
                                src="${noCILogoUri}"
                            />
                        </td>
                    </tr>
                </table>

                <!--This element is always hidden, but it transfers the value of the ciToolChosen from TS to JS upon loading this webview-->
                <h6 hidden id="hCiToolChosen">${config.getCiToolChosen()}</h6>
                
                <div class="row" id="groupGitHubActions">
                    <h2>GitHub Actions</h2>
                    <p>All set - no further information is needed for GitHub Actions.</p>
                </div>

                <div class="row" id="groupJenkins">
                    <h2>Jenkins</h2>
                    <p>We'll need your job URL and API key. We use this to identify which files caused build failures.</p>
                    <table>
                        <tr>
                            <td>
                                Jenkins URL
                            </td>
                            <td>
                                <input type="text" id="inputCI_URL_Jenkins" name="inputCI" placeholder="Format: https://<host url>/job/<job name>/" value="${jenkinsUrl}" class="inputTextField">
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Jenkins Username
                            </td>
                            <td>
                                <input type="text" id="inputCI_Username_Jenkins" name="inputCI" placeholder="Username" value="${jenkinsUsername}" class="inputTextField">
                            </td>
                        </tr>
                        <tr>
                            <td>
                                API Key
                            </td>
                            <td>
                                <input type="text" id="inputApiKey_Jenkins" name="inputCI" placeholder="Ex: 618edd6a084b245d5a1c5d143a338c2bda" value="${jenkinsApiKey}" class="inputTextField">
                            </td>
                        </tr>
                    </table>
                    <br></br>
                </div>
                <div class="row" id="groupNoCI">
                    <h2>No CI tool in use.</h2>
                </div>
                <br></br>
                <div class="row">
                    <h2>GitHub Personal Acccess Token</h2>
                    <table>
                        <tr>
                            <td>
                                Personal Access Token
                            </td>
                            <td>
                                <input type="password" id="inputPersonalAccessToken" name="inputPersonalAccessToken" placeholder="Personal access token to authenticate with your git repo" value="${personalAccessToken}" class="inputTextField">
                            </td>
                    </table>
                </div>
                <div class="row">
                    <h2>Codebase Insights Self-Hosting</h2>
                    <table>
                        <tr>
                            <td>
                                Custom Codebase Insights Service URL
                            </td>
                            <td>
                                <input type="text" id="inputAxiosUrl" name="inputAxiosUrl" placeholder="URL where you'd like the plugin to send requests" value="${axiosUrl}" class="inputTextField">
                            </td>
                            <td>
                                <input onclick="restoreDefaultAxiosUrl()" id="btnRestoreAxiosDefault" class="inputSubmit innerDivToCenter" type="submit" value="Restore Default">
                            </td>
                    </table>
                </div>
                <table style="width: 100%;">
                    <input onclick="submitCredentials()" id="btnSubmitCredentials" class="inputSubmit innerDivToCenter" type="submit" value="Save Changes And Request Analysis">
                    <h4 id="hUpdatingAccount"></h4>
                </table>
            </div>
        </body>
        <script src="${scriptUri}"/>
    </HTML>
    `;
}
