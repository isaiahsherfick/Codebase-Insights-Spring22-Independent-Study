import * as vscode from "vscode";

export function getPreference(desiredPreference: string) {
  let configuration = vscode.workspace.getConfiguration("codebase-insights");
  let preference = configuration[desiredPreference];
  if (preference) {
    return preference;
  } else {
    return "";
  }
}

export async function setPreference(
  desiredPreference: string,
  value: string | number | undefined
) {
  let configuration = vscode.workspace.getConfiguration("codebase-insights");
  await configuration.update(desiredPreference, value, true);
}

export function getGitUrl(): string {
  return getPreference("repoURL");
}

export async function setGitUrl(url: string): Promise<void> {
  return setPreference("repoURL", url);
}

export function getBranchName(): string {
  return getPreference("branchName");
}

export function getGithubActionsWorkflowId(): string {
  return getPreference("githubActionsWorkflowId");
}

export async function setGithubActionsWorkflowId(
  workflowId: string
): Promise<void> {
  return setPreference("githubActionsWorkflowId", workflowId);
}

export async function setBranchName(branchName: string): Promise<void> {
  return setPreference("branchName", branchName);
}

export function getCiUsername(): string {
  return getPreference("ciUsername");
}

export async function setCiUsername(login: string): Promise<void> {
  return setPreference("ciUsername", login);
}

export function getApiKey(): string {
  return getPreference("apiKey");
}

export async function setApiKey(apiKey: string): Promise<void> {
  return setPreference("apiKey", apiKey);
}

export function getJobUrl(): string {
  return getPreference("jobUrl");
}

export async function setJobUrl(url: string): Promise<void> {
  return setPreference("jobUrl", url);
}

export async function clearFilteredAuthors(): Promise<void> {
  return setPreference("filteredAuthors", "");
}

export function getAllFilteredAuthors(): Promise<Array<String>> {
  return getPreference("filteredAuthors");
}

export async function addFilteredAuthor(filteredAuthor: string): Promise<void> {
  let currentFilteredAuthors = getPreference("filteredAuthors");
  currentFilteredAuthors += " " + filteredAuthor;
  return setPreference("filteredAuthors", currentFilteredAuthors);
}

export async function setPersonalAccessToken(pat: string): Promise<void> {
  return setPreference("personalAccessToken", pat);
}

export function getPersonalAccessToken(): string {
  return getPreference("personalAccessToken");
}


export function getJenkinsSettings() {
  return {
    ciUsername: getCiUsername(),
    apiKey: getApiKey(),
    jobUrl: getJobUrl(),
  };
}

export async function setAxiosUrl(url: string): Promise<void> {
  return setPreference("axiosUrl", url);
}

export function getAxiosUrl(): string {
  return getPreference("axiosUrl");
}

export function getCiToolChosen(): string {
  return getPreference("ciToolChosen");
}

export async function setCiToolChosen(ciToolChosen: string): Promise<void> {
  return setPreference("ciToolChosen", ciToolChosen);
}

export function getSettingsPayload() {
  return {  
    githubUrl: getGitUrl(),
    branchName: getBranchName(),
    ciToolChosen: getCiToolChosen(),
    ciUsername: getCiUsername(),
    apiKey: getApiKey(),
    jobUrl: getJobUrl(),
    githubOAuthToken: getPersonalAccessToken()
  };
}

export function getUrlPayload() {
  return {  
    githubUrl: getGitUrl(),
    branchName: getBranchName(),
    oAuthToken: getPersonalAccessToken(),
    stagedFiles: {}
  };
}