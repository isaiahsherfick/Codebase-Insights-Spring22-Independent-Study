import axios, { AxiosAdapter, AxiosInstance } from "axios";
import * as vscode from "vscode";
export default class GithubOAuth {

    private static readonly accessTokenKey: string = "CODE_INSIGHTS_ACCESS_TOKEN";

    private clientId: string;
    private scope: string;

    private axiosInstance: AxiosInstance;
    private static _instance: GithubOAuth;

    private deviceCode: string = "";
    private userCode: string = "";
    private verificationUri: string = "";
    private grantType: string;
    private constructor() {

        this.axiosInstance = axios.create({
            baseURL: process.env.GITHUB_URL || "https://github.com",
            timeout: 3000,
        });

        this.clientId = process.env.CLIENT_ID || "013ff78674bdb9e132c6";
        this.scope = process.env.SCOPE || "read:org,repo";
        this.grantType = process.env.GRANT_TYPE || "urn:ietf:params:oauth:grant-type:device_code";
    }

    /**
     * Get singleton instance for the Connector to Global State Storage
     */
    public static get instance(): GithubOAuth {
        if (!this._instance) {
            this._instance = new GithubOAuth();
        }
        return this._instance;
    }


    public checkOAuthStatus(context: vscode.ExtensionContext): boolean {
        return context.globalState.get(GithubOAuth.accessTokenKey) !== undefined;
    }


    /**
     * Fetches the device code and user code from the GitHub API and buffers them in the GithubOAuth Class for use
     * @returns { deviceCode: string, userCode: string }
     */
    public async fetchDeviceAndUserCode(): Promise<{ deviceCode: string, userCode: string }> {

        try {

            if (!this.clientId) {
                throw new Error("Client ID not maintained");
            }


            const response = await this.axiosInstance.post(`/login/device/code?client_id=${this.clientId}&scope=${this.scope}`);

            const responseString: string = response.data;

            if (response.status !== 200) {
                throw new Error("Response status is not 200");
            }

            const responseValues = responseString.split("&");
            for (const responseValue of responseValues) {
                const [key, value] = responseValue.split("=");
                if (key === "device_code") {
                    this.deviceCode = value;
                }
                if (key === "user_code") {
                    this.userCode = value;
                }
                if (key === "verification_uri") {
                    this.verificationUri = value;
                }
            }

            return { deviceCode: this.deviceCode, userCode: this.userCode };

        } catch (ex) {
            throw ex;
        }
    }

    public async fetchAccessToken(context: vscode.ExtensionContext): Promise<void> {
        let accessToken = undefined;

        try {

            if (!this.deviceCode || !this.userCode) {
                await this.fetchDeviceAndUserCode();
            }

            const response = await this.axiosInstance.
                post(`/login/oauth/access_token?client_id=${this.clientId}&device_code=${this.deviceCode}&grant_type=${this.grantType}`);

            if (response.status !== 200) {
                throw new Error(`Failed to get access token. Response status ${response.status} : ${response.statusText}`);
            }

            const responseString: string = response.data;
            console.log(responseString);

            const responseValues = responseString.split("&");

            for (const responseValue of responseValues) {
                const [key, value] = responseValue.split("=");
                if (key === "access_token") {
                    accessToken = value;
                }
            }

            if (!accessToken) {
                throw new Error("Unable to get access token");
            }

            context.globalState.update(GithubOAuth.accessTokenKey, accessToken);

        } catch (ex) {
            throw ex;
        }

    }

    public async triggerUserAuthDialogs(context: vscode.ExtensionContext) {

        if (!this.userCode || !this.deviceCode) {
            try {
                await this.fetchDeviceAndUserCode();
            } catch (ex) {
                vscode.window.showErrorMessage("Unable to connect to GitHub.");
                return;
            }
        }

        // show dialog
        const openVerificationPage = "Open Verification Page";
        const copyUserCode = "Click to copy user code";

        // show User Code info message
        vscode.window.showInformationMessage("Click here to copy your user code to clipboard", copyUserCode)
            .then(async () => {
                await vscode.env.clipboard.writeText(this.userCode);
            });


        // show auth page info message
        vscode.window.showInformationMessage("Click here to open auth page. Paste your user code on the Github authentication page ",
            openVerificationPage)
            .then(() => {
                // open URL 
                this.openGitHubAuthWindow();
            });


        // cache the Access Token
        // try {
        //     this.fetchAccessToken(context);
        //     console.log(context.globalState.get(GithubOAuth.accessTokenKey));
        // } catch (ex) {
        //     vscode.window.showErrorMessage("Unable to fetch access token");
        //     return;
        // }
    }

    public async copyUserCodeToClipboard() {
        if (!this.userCode || !this.deviceCode) {
            try {
                await this.fetchDeviceAndUserCode();
            } catch (ex) {
                console.log(ex);
                vscode.window.showErrorMessage("Unable to connect to GitHub.");
                return;
            }
        }

        await vscode.env.clipboard.writeText(this.userCode);
    }

    public openGitHubAuthWindow() {
        vscode.env.openExternal(vscode.Uri.parse("https://github.com/login/device"));
    }
}
