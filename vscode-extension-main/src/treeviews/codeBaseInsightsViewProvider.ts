import * as vscode from "vscode";
import { CodeBaseInsightsView } from "./codeBaseInsightsView";

export class CodebaseInsightsViewProvider
  implements vscode.TreeDataProvider<CodeBaseInsightsView>
{
  getTreeItem(element: CodeBaseInsightsView) {
    return element;
  }

  getChildren(
    element?: CodeBaseInsightsView
  ): Thenable<CodeBaseInsightsView[]> {
    return Promise.resolve(this.getViews());
  }

  private getViews(): CodeBaseInsightsView[] {
    let views = [];
    let loginSignup = new CodeBaseInsightsView(
      "Login / Signup",
      vscode.TreeItemCollapsibleState.None,
      "Login or signup for Codebase Insights"
    );
    let settings = new CodeBaseInsightsView(
      "Settings",
      vscode.TreeItemCollapsibleState.None,
      "Quick place to update the relevant settings for Codebase Insights"
    );
    let map = new CodeBaseInsightsView(
      "Code Map",
      vscode.TreeItemCollapsibleState.None,
      "A configurable heatmap for viewing your codebase graphically and analyzing various metrics as a gradient"
    );
    let coauthorship = new CodeBaseInsightsView(
      "Coauthorship Network",
      vscode.TreeItemCollapsibleState.None,
      "A network showing the areas where each contributor on your project has knowledge"
    );
    let risk = new CodeBaseInsightsView(
      "Commit Risk Assessment",
      vscode.TreeItemCollapsibleState.None,
      "View your changes currently staged for commit and assess the potential risks associated with your changes"
    );
    views = [settings, map, coauthorship, risk];
    return views;
  }
}
