var stagedFiles;
var urlPayload;


window.addEventListener("message", (event) => {
    if (event.data.command === "stagedFiles") {
        stagedFiles = event.data.data.stagedFiles;
        urlPayload = event.data.data;
        let i;
        let filesList = document.getElementById("filesList");
        let innerHTML = "";
        for (i=0; i < stagedFiles.length; i++)
        {
            innerHTML += "<li>" + stagedFiles[i] + "</li>";
        }
        filesList.innerHTML = innerHTML;
    }
    else if (event.data.command === "submitRequest") {
        //Submit staged files to backend
    }
});

function submitStagedFiles() {
    displayRequestSentMessage();
    try {
        const resp = axios.post('http://localhost:8080/api/knowledge/commit-risk-file-group', urlPayload);
        console.log("Your data is here: " + resp.data);
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
}

function displayRequestSentMessage() {
    let requestInfo = document.getElementById("requestInfo");
    requestInfo.innerHTML = "Waiting on analysis results...";
}