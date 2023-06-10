import * as codeMap from "./codeMap/codeMap";
import * as coauthorshipNetwork from "./coauthorshipNetwork/coauthorshipNetwork";
import * as commitRiskAssessment from "./commitRiskAssessment/commitRiskAssessment";
import * as settings from "./settings/settings";
import * as loginSignup from "./loginSignup/loginSignup";
import * as vscode from "vscode";

//args maps names to external script/css files
//i.e. args.get("d3") === d3Uri: vscode.Uri
export function generateCodeMapHTML(args: Map<string, vscode.Uri>): string {
  return codeMap.codemapHTML(args);
}
export function generateCommitRiskAssessmentHTML(
  args: Map<string, vscode.Uri>
): string {
  return commitRiskAssessment.commitRiskAssessmentHTML(args);
}
export function generateCoauthorshipNetworkHTML(
  args: Map<string, vscode.Uri>
): string {
  return coauthorshipNetwork.coauthorshipNetworkHTML(args);
}
export function generateSettingsHTML(args: Map<string, vscode.Uri>): string {
  return settings.settingsHTML(args);
}
export function generateLoginSignupHTML(args: Map<string, vscode.Uri>): string {
  return loginSignup.loginSignupHTML(args);
}
