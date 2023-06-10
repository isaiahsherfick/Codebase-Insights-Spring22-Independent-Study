/*
 * This file uses submitCredentials() to send all data from the form controls to the API.
 * Other functions are used to show/hide controls.
 */

const vscode = acquireVsCodeApi(); //allows us to use message passing back to the extension for tweaking parameters


//Updating account message
const hUpdatingAccount = document.getElementById("hUpdatingAccount");
hUpdatingAccount.hidden = true;

////// CI Tool Controls to Submit API Key & Other Inputs //////
const groupGitHubActions = document.getElementById("groupGitHubActions");
const groupJenkins = document.getElementById("groupJenkins");
const groupNoCI = document.getElementById("groupNoCI");
var ciToolChosen = "NONE";
function hideAllCIGroups() {
  groupGitHubActions.hidden = true;
  groupJenkins.hidden = true;
  groupNoCI.hidden = true;
}
hideAllCIGroups();


//Show current selection based on value of ciToolChosen in config
const hCiToolChosen = document.getElementById("hCiToolChosen");
switch (hCiToolChosen.innerHTML)
{
  case "GitHub Actions":
    {
      groupGitHubActions.hidden = false;
      break;
    }
    case "Jenkins":
    {
      groupJenkins.hidden = false;
      break;
    }
    default: //No CI
    {
      groupNoCI.hidden = false;
      break;
    }
}


//onSelect GitHub Actions as CI
document.getElementById("imgChooseGitHubActions").addEventListener("click", function (e) {
  hideAllCIGroups();
  groupGitHubActions.hidden = false;
  ciToolChosen = "GitHub Actions";
});
//onSelect Jenkins as CI
document.getElementById("imgChooseJenkins").addEventListener("click", function (e) {
  hideAllCIGroups();
  groupJenkins.hidden = false;
  ciToolChosen = "Jenkins";
});
//Select No CI
document.getElementById("imgChooseNoCI").addEventListener("click", function (e) {
  hideAllCIGroups();
  groupNoCI.hidden = false;
  ciToolChosen = "NONE";
});


//Click submit button to update account
function submitCredentials() 
{
  //Prepare payload to send to server
  var payload = {};

  //Extract GitHub repo URL from form control into payload object
  let githubUrl = document.getElementById("inputGitUrl").value;
  payload["githubUrl"] = githubUrl;
  let branchName = document.getElementById("inputBranchName").value;
  payload["branchName"] = branchName; //OPTIONAL
  let axiosUrl = document.getElementById("inputAxiosUrl").value;
  payload["axiosUrl"] = axiosUrl;
  let personalAccessToken = document.getElementById("inputPersonalAccessToken").value;
  payload["personalAccessToken"] = personalAccessToken;
  
  //Validate
  if (isEmpty(githubUrl)) {
    vscode.postMessage({
      command: "alert",
      data: "Required: GitHub URL"
    });
    return;
  }

  //Extract CI tool info from form controls into payload object
  payload["ciToolChosen"] = ciToolChosen;
  switch (ciToolChosen)
  {
    case "GitHub Actions":
    {
      //Nothing more needed
      break;
    }
    case "Jenkins":
    {
      const jobUrl = document.getElementById("inputCI_URL_Jenkins").value;
      const ciUsername = document.getElementById("inputCI_Username_Jenkins").value;
      const apiKey = document.getElementById("inputApiKey_Jenkins").value;

      //Validate
      if (isEmpty(jobUrl) || isEmpty(ciUsername) || isEmpty(apiKey)) {
        vscode.postMessage({
          command: "alert",
          data: "Required field(s) for Jenkins missing"
        });
        return;
      }

      payload["jobUrl"] = jobUrl;
      payload["ciUsername"] = ciUsername;
      payload["apiKey"] = apiKey;
      break;
    }
    case "NONE":
    {
      //No CI. Nothing special is needed.
      break;
    }
    default:
    {
      //No selection made, show error
      vscode.postMessage({
        command: "alert",
        data: "Please select your CI tool"
      });
    }
  }

  //Make API call(s)
  vscode.postMessage({
    command: "submitSettingsChange",
    data: payload
  });
  //Show msg to indicate API is doing its work
  hUpdatingAccount.innerHTML = "We're now analyzing your codebase...";
  hUpdatingAccount.hidden = false;
}

function isEmpty(str) {
  return (!str || str.length === 0 );
}




//Handle message passing
window.addEventListener("message", (event) => {
  if (event.data.command === "api-status-message")
  {
    //Show message sent by TS file
    hUpdatingAccount.innerHTML = event.data.data;
  }
  else
  {
    console.error('Unrecognized message passed to settings script:');
    console.error(event);
  }
});

function restoreDefaultAxiosUrl() {
  let field = document.getElementById("inputAxiosUrl");
  field.value = "https://refactor-radar.herokuapp.com/api";
}