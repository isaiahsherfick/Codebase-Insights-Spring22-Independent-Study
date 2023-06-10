import * as vscode from "vscode";
import * as webviewFactory from "./webviews/webviewFactory";
import { CodebaseInsightsViewProvider } from "./treeviews/codeBaseInsightsViewProvider";
import path = require("path");
import GithubOAuth from "./utils/GithubOAuth";

//This function is called when any of the events in package.json.activationEvents are thrown
export function activate(context: vscode.ExtensionContext) {
  console.log("Codebase Insights extension activated!");

  vscode.window.registerTreeDataProvider(
    "codebaseInsightsTree",
    new CodebaseInsightsViewProvider()
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("codebase-insights.oauth", () => {
      // check if the OAuth Details are already set
      try {
        if (GithubOAuth.instance.checkOAuthStatus(context)) {
          // Access Token is set. So no need to fetch the details from the API
          console.log("Access Token Present");
        } else {
          GithubOAuth.instance.triggerUserAuthDialogs(context);

          // call GithubOAuth.instance.fetchAccessToken() -- or create a different command to do the same
        }
      } catch (ex) {
        vscode.window.showErrorMessage("Error:" + ex);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("codebase-insights.loginSignup", () => {
      webviewFactory.createOrShowLoginSignupPanel(context);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("codebase-insights.settings", () => {
      webviewFactory.createOrShowSettingsPanel(context);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("codebase-insights.code-map", () => {
      webviewFactory.createOrShowCodeMapPanel(context);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("codebase-insights.coauthorship-network", () => {
      webviewFactory.createOrShowCoauthorshipNetworkPanel(context);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codebase-insights.commit-risk-assessment",
      () => {
        webviewFactory.createOrShowCommitRiskAssessmentPanel(context);
      }
    )
  );
}

//If we need to close resources in the case where the user closes VSCode while our extension is running, this is where to do it
export function deactivate() {}
