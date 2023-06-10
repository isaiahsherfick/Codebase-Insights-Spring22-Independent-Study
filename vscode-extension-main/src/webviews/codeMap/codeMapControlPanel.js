const vscode = acquireVsCodeApi(); //allows us to use message passing back to the extension for tweaking parameters

//Stuff for the control panel
function openNav() {
  openControlPanelById("controlPanel");
}
function openPanel2() {
  openControlPanelById("controlPanel2");
}
function openControlPanelById(id) {
  let controlPanel = document.getElementById(id);
  if (controlPanel.style.width === "0px" || !controlPanel.style.width) {
    //it's undefined the first time you hit the button, which is a case where we want to set it to 250px
    controlPanel.style.width = "250px";
  } else {
    controlPanel.style.width = "0px";
  }
}
function closeNav() {
  document.getElementById("controlPanel").style.width = "0";
}
function closeNav2() {
  document.getElementById("controlPanel2").style.width = "0";
}
function buttonExample() {
  vscode.postMessage({
    data: "Thanks for pressing that button!",
  });
}
