/*
 * This file uses submitCredentials() to send all data from the form controls to the API.
 * Other functions are used to show/hide controls.
 */

const vscode = acquireVsCodeApi(); //allows us to use message passing back to the extension for tweaking parameters

function openGitHubAuthWindow()
{
  vscode.postMessage({
    command: "openGitHubAuthWindow"
  });
}

function copyGitHubAuthCode()
{
  vscode.postMessage({
    command: "copyGitHubAuthCode"
  });
}





//Handle message passing
window.addEventListener("message", (event) => {
  console.error('Unrecognized message passed to login/signup script:');
});