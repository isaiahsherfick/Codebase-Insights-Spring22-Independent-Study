import path = require("path");
import * as vscode from "vscode";
import * as htmlFactory from "./htmlFactory";
import * as config from "../config/config";
import { getUrlPayload } from "../config/config";
import * as git from "../utils/git";
import GithubOAuth from "../utils/GithubOAuth";
import { postCredentials, postModifiedHeatValues } from "../api/api";

//Webviews -- use these for message passing.
export let loginSignupWebviewPanel: vscode.WebviewPanel | undefined;
export let settingsWebviewPanel: vscode.WebviewPanel | undefined;
export let codeMapWebviewPanel: vscode.WebviewPanel | undefined;
export let coauthorshipNetworkWebviewPanel: vscode.WebviewPanel | undefined;
export let commitRiskAssessmentWebviewPanel: vscode.WebviewPanel | undefined;

const preferredColumn: vscode.ViewColumn = vscode.ViewColumn.One;

export function createOrShowLoginSignupPanel(
  context: vscode.ExtensionContext
): void {
  safelyDisposeAllButLoginSignup();
  if (loginSignupWebviewPanel) {
    loginSignupWebviewPanel.reveal(preferredColumn);
  } else {
    loginSignupWebviewPanel = vscode.window.createWebviewPanel(
      "loginSignupPage",
      "Login / Signup",
      preferredColumn,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(
            path.join(
              context.extensionPath,
              "out/webviews/loginSignup"
            )
          ),
        ],
      }
    );

    const cssOnDiskPath = vscode.Uri.file(
      path.join(
        context.extensionPath,
        "out/webviews/loginSignup",
        "loginSignup.css"
      )
    );
    const cssUri =
      loginSignupWebviewPanel.webview.asWebviewUri(cssOnDiskPath);
    const scriptOnDiskPath = vscode.Uri.file(
      path.join(
        context.extensionPath,
        "out/webviews/loginSignup",
        "loginSignupScript.js"
      )
    );
    const scriptUri =
      loginSignupWebviewPanel.webview.asWebviewUri(scriptOnDiskPath);

    let args: Map<string, vscode.Uri> = new Map();
    args.set("css", cssUri);
    args.set("script", scriptUri);

    loginSignupWebviewPanel.webview.html =
      htmlFactory.generateLoginSignupHTML(args);
    loginSignupWebviewPanel.onDidDispose(() => {
      loginSignupWebviewPanel = undefined;
    });
    loginSignupWebviewPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "alert":
          vscode.window.showInformationMessage(message.data);
          break;
        case "copyGitHubAuthCode":
          GithubOAuth.instance.copyUserCodeToClipboard();
          vscode.window.showInformationMessage("Copied to clipboard!");
          break;
        case "openGitHubAuthWindow":
          GithubOAuth.instance.openGitHubAuthWindow();
          break;
        default:
          console.error("Invalid message command `"+message.command+"` sent to loginSignupWebviewPanel");
          break;
      }
    });
  }
}

export function createOrShowSettingsPanel(
  context: vscode.ExtensionContext
): void {
  safelyDisposeAllButSettings();
  if (settingsWebviewPanel) {
    settingsWebviewPanel.reveal(preferredColumn);
  } else {
    settingsWebviewPanel = vscode.window.createWebviewPanel(
      "settingsPage",
      "Settings",
      preferredColumn,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(
            path.join(context.extensionPath, "out/webviews/settings")
          ),
        ],
      }
    );

    //Image paths
    const jenkinsLogoOnDiskPath = vscode.Uri.file(
      path.join(context.extensionPath, "out/webviews/settings", "jenkinsLogo.png")
    );
    const jenkinsLogoUri = settingsWebviewPanel.webview.asWebviewUri(jenkinsLogoOnDiskPath);
    const githubActionsLogoOnDiskPath = vscode.Uri.file(
      path.join(context.extensionPath, "out/webviews/settings", "githubActionsLogo.png")
    );
    const githubActionsLogoUri = settingsWebviewPanel.webview.asWebviewUri(githubActionsLogoOnDiskPath);
    const noCILogoOnDiskPath = vscode.Uri.file(
      path.join(context.extensionPath, "out/webviews/settings", "noCILogo.png")
    );
    const noCILogoUri = settingsWebviewPanel.webview.asWebviewUri(noCILogoOnDiskPath);

    //CSS & vanilla JS
    const cssOnDiskPath = vscode.Uri.file(
      path.join(context.extensionPath, "out/webviews/settings", "settings.css")
    );
    const cssUri = settingsWebviewPanel.webview.asWebviewUri(cssOnDiskPath);
    const scriptOnDiskPath = vscode.Uri.file(
      path.join(
        context.extensionPath,
        "out/webviews/settings",
        "settingsScript.js"
      )
    );
    const scriptUri =
      settingsWebviewPanel.webview.asWebviewUri(scriptOnDiskPath);

    let args: Map<string, vscode.Uri> = new Map();
    args.set("css", cssUri);
    args.set("script", scriptUri);
    args.set("jenkinsLogo", jenkinsLogoUri);
    args.set("githubActionsLogo", githubActionsLogoUri);
    args.set("noCILogo", noCILogoUri);

    settingsWebviewPanel.webview.html = htmlFactory.generateSettingsHTML(args);
    settingsWebviewPanel.onDidDispose(() => {
      settingsWebviewPanel = undefined;
    });
    settingsWebviewPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "alert":
          vscode.window.showInformationMessage(message.data);
          break;
        case "submitSettingsChange":
          const payload = message.data;
          //Save inputs locally
          config.setGitUrl(payload["githubUrl"]); 
          config.setBranchName(payload["branchName"]);
          config.setJobUrl(payload["jobUrl"]); 
          config.setCiToolChosen(payload["ciToolChosen"]); 
          config.setCiUsername(payload["ciUsername"]); 
          config.setApiKey(payload["apiKey"]); 
          config.setAxiosUrl(payload["axiosUrl"]);
          config.setPersonalAccessToken(payload["personalAccessToken"]);
          //Send to API
          postCredentials(payload, settingsWebviewPanel);
          break;
        default:
          console.error("Invalid message command `"+message.command+"` sent to loginSignupWebviewPanel");
          break;
      }
    });
  }
}

export function createOrShowCodeMapPanel(
  context: vscode.ExtensionContext
): void {
  safelyDisposeAllButCodeMap();
  if (codeMapWebviewPanel) {
    codeMapWebviewPanel.reveal(preferredColumn);
  } else {
    codeMapWebviewPanel = vscode.window.createWebviewPanel(
      "codeMapPage",
      "Code Map",
      preferredColumn,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(
            path.join(context.extensionPath, "out/webviews/codeMap")
          ),
          vscode.Uri.file(path.join(context.extensionPath, "resources/d3")),
        ],
      }
    );

    const cssOnDiskPath = vscode.Uri.file(
      path.join(context.extensionPath, "out/webviews/codeMap", "codeMap.css")
    );
    const cssUri = codeMapWebviewPanel.webview.asWebviewUri(cssOnDiskPath);
    const scriptOnDiskPath = vscode.Uri.file(
      path.join(
        context.extensionPath,
        "out/webviews/codeMap",
        "codeMapScript.js"
      )
    );
    const scriptUri =
      codeMapWebviewPanel.webview.asWebviewUri(scriptOnDiskPath);

    const controlPanelScriptOnDiskPath = vscode.Uri.file(
      path.join(
        context.extensionPath,
        "out/webviews/codeMap",
        "codeMapControlPanel.js"
      )
    );
    const controlPanelScriptUri = codeMapWebviewPanel.webview.asWebviewUri(
      controlPanelScriptOnDiskPath
    );

    const radarChartScriptOnDiskPath = vscode.Uri.file(
      path.join(
        context.extensionPath,
        "out/webviews/codeMap",
        "radarChartScript.js"
      )
    );
    const radarChartScriptUri = codeMapWebviewPanel.webview.asWebviewUri(
      radarChartScriptOnDiskPath
    );

    const d3OnDiskPath = vscode.Uri.file(
      path.join(context.extensionPath, "resources/d3", "d3.min.js")
    );
    const d3Uri = codeMapWebviewPanel.webview.asWebviewUri(d3OnDiskPath);

    let args: Map<string, vscode.Uri> = new Map();
    args.set("css", cssUri);
    args.set("codeMapScript", scriptUri);
    args.set("controlPanel", controlPanelScriptUri);
    args.set("d3", d3Uri);
    args.set("radarChart", radarChartScriptUri);

    codeMapWebviewPanel.webview.html = htmlFactory.generateCodeMapHTML(args);
    codeMapWebviewPanel.onDidDispose(() => {
      codeMapWebviewPanel = undefined;
    });
    codeMapWebviewPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "alert":
          vscode.window.showInformationMessage(message.data);
          break;
        case "submitHeatValueFeedback":
          const payload = message.data;
          //Send to API
          postModifiedHeatValues(payload, codeMapWebviewPanel);
          break;
        default:
          console.error("Invalid message command `"+message.command+"` sent to ");
          break;
      }
    });
  }
}

export function createOrShowCoauthorshipNetworkPanel(
  context: vscode.ExtensionContext
): void {
  safelyDisposeAllButCoauthorshipNetwork();
  if (coauthorshipNetworkWebviewPanel) {
    coauthorshipNetworkWebviewPanel.reveal(preferredColumn);
  } else {
    coauthorshipNetworkWebviewPanel = vscode.window.createWebviewPanel(
      "coauthorshipNetwork",
      "Coauthorship Network",
      preferredColumn,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(
            path.join(context.extensionPath, "out/webviews/coauthorshipNetwork")
          ),
          vscode.Uri.file(path.join(context.extensionPath, "resources/d3")),
          vscode.Uri.file(path.join(context.extensionPath, "resources/venn")),
        ],
      }
    );

    const cssOnDiskPath = vscode.Uri.file(
      path.join(
        context.extensionPath,
        "out/webviews/coauthorshipNetwork",
        "coauthorshipNetwork.css"
      )
    );
    const cssUri =
      coauthorshipNetworkWebviewPanel.webview.asWebviewUri(cssOnDiskPath);
    const coauthorshipNetworkScriptOnDiskPath = vscode.Uri.file(
      path.join(
        context.extensionPath,
        "out/webviews/coauthorshipNetwork",
        "coauthorshipNetworkScript.js"
      )
    );
    const coauthorshipNetworkScriptUri =
      coauthorshipNetworkWebviewPanel.webview.asWebviewUri(
        coauthorshipNetworkScriptOnDiskPath
      );

    const d3OnDiskPath = vscode.Uri.file(
      path.join(context.extensionPath, "resources/d3", "d3.min.js")
    );
    const d3Uri = coauthorshipNetworkWebviewPanel.webview.asWebviewUri(d3OnDiskPath);

    const vennOnDiskPath = vscode.Uri.file(
      path.join(context.extensionPath, "resources/venn", "venn.js")
    );
    const vennUri = coauthorshipNetworkWebviewPanel.webview.asWebviewUri(vennOnDiskPath);

    let args: Map<string, vscode.Uri> = new Map();
    args.set("css", cssUri);
    args.set("coauthorshipNetworkScript", coauthorshipNetworkScriptUri);
    args.set("d3", d3Uri);
    args.set("venn", vennUri);

    coauthorshipNetworkWebviewPanel.webview.html =
      htmlFactory.generateCoauthorshipNetworkHTML(args);
    coauthorshipNetworkWebviewPanel.onDidDispose(() => {
      coauthorshipNetworkWebviewPanel = undefined;
    });
    coauthorshipNetworkWebviewPanel.webview.onDidReceiveMessage((message) => {
      vscode.window.showInformationMessage(message.data);
    });
  }
}

export async function createOrShowCommitRiskAssessmentPanel(
  context: vscode.ExtensionContext
): Promise<void> {
  safelyDisposeAllButCommitRiskAssessment();
  if (commitRiskAssessmentWebviewPanel) {
    commitRiskAssessmentWebviewPanel.reveal(preferredColumn);
  } else {
    commitRiskAssessmentWebviewPanel = vscode.window.createWebviewPanel(
      "commitRiskAssessment",
      "Commit Risk Assessment",
      preferredColumn,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(
            path.join(
              context.extensionPath,
              "out/webviews/commitRiskAssessment"
            )
          ),
        ],
      }
    );

    const cssOnDiskPath = vscode.Uri.file(
      path.join(
        context.extensionPath,
        "out/webviews/commitRiskAssessment",
        "commitRiskAssessment.css"
      )
    );
    const cssUri =
      commitRiskAssessmentWebviewPanel.webview.asWebviewUri(cssOnDiskPath);
    const scriptOnDiskPath = vscode.Uri.file(
      path.join(
        context.extensionPath,
        "out/webviews/commitRiskAssessment",
        "commitRiskAssessmentScript.js"
      )
    );
    const scriptUri =
      commitRiskAssessmentWebviewPanel.webview.asWebviewUri(scriptOnDiskPath);

    let args: Map<string, vscode.Uri> = new Map();
    args.set("css", cssUri);
    args.set("script", scriptUri);

    commitRiskAssessmentWebviewPanel.webview.html =
      htmlFactory.generateCommitRiskAssessmentHTML(args);
    commitRiskAssessmentWebviewPanel.onDidDispose(() => {
      commitRiskAssessmentWebviewPanel = undefined;
    });
    let stagedFiles = await git.getStagedFiles();
    let urlPayload = getUrlPayload();
    urlPayload.stagedFiles = stagedFiles;
    commitRiskAssessmentWebviewPanel.webview.postMessage({command: "stagedFiles", data: urlPayload});
  }
}


function safelyDisposeWebviewPanel(
  webview: vscode.WebviewPanel | undefined
): void {
  if (webview) {
    webview.dispose();
  }
}

function safelyDisposeAllBut(panel: vscode.WebviewPanel | undefined): void {
  let panels = [
    loginSignupWebviewPanel,
    coauthorshipNetworkWebviewPanel,
    commitRiskAssessmentWebviewPanel,
    codeMapWebviewPanel,
    settingsWebviewPanel
  ];
  for (let i = 0; i < panels.length; i++) {
    if (panels[i] !== panel) {
      safelyDisposeWebviewPanel(panels[i]);
    }
  }
}

function safelyDisposeAllButCodeMap(): void {
  safelyDisposeAllBut(codeMapWebviewPanel);
}

function safelyDisposeAllButCoauthorshipNetwork(): void {
  safelyDisposeAllBut(coauthorshipNetworkWebviewPanel);
}

function safelyDisposeAllButCommitRiskAssessment(): void {
  safelyDisposeAllBut(commitRiskAssessmentWebviewPanel);
}

function safelyDisposeAllButSettings(): void {
  safelyDisposeAllBut(settingsWebviewPanel);
}
function safelyDisposeAllButLoginSignup(): void {
    safelyDisposeAllBut(loginSignupWebviewPanel);
}
