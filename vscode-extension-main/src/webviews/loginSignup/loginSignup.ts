import * as vscode from "vscode";
import * as config from "../../config/config";

export function loginSignupHTML(args: Map<string, vscode.Uri>): string {
  const cssUri = args.get("css");
  const scriptUri = args.get("script");

  //TODO Check if the OAuth Details are already set
  let gitOAuthToken = "";
  var hasAccessToken = gitOAuthToken && gitOAuthToken !== "";

  return `
    <!DOCTYPE HTML>
    <HTML>
        <head>
            <meta charset="UTF-8" lang="en"/>
            <link rel="stylesheet" type="text/css" href="${cssUri}"/>
        </head>
        <body>
            <div class="page">
                <h1> Login </h1>
                <!--OAuth-->
                <h2>GitHub Sign-in</h2>
                <div id="groupGitHubAuth">
                    ${hasAccessToken ? 
                        //If authenticated, display OK msg
                        '<h3>Authenticated with GitHub ✅</h3>' : 
                        //Else, show auth buttons
                        '<table> \
                            <h4>Step 1. Click the button to copy your authorization code</h4> \
                            <button onClick="copyGitHubAuthCode()" class="innerDivToCenter">Click here to copy the code</button> \
                            <br class="spacer-mini" /> \
                            <h4>Step 2. Paste the authorization code into your browser after clicking the button below to open the GitHub login website</h4> \
                            <button onClick="openGitHubAuthWindow()" class="innerDivToCenter">Log In with GitHub</button> \
                        </table>'
                    }
                </div>
            </div>
        </body>
        <script src="${scriptUri}"/>
    </HTML>
    `;
}
