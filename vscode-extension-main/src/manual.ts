import GithubOAuth from "./utils/GithubOAuth";

async function check() {
    await GithubOAuth.instance.fetchDeviceAndUserCode();
}
 
check();
