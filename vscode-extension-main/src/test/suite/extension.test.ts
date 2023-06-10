import * as assert from "assert";
import * as vscode from "vscode";
import * as mockCodeMap from "../../api/mockCodeMap";
import {
  ContributorObject,
  mockCoauthorshipNetworkGETRequest,
} from "../../api/mockCoauthorshipNetwork";
import * as config from "../../config/config";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");
  test("Random mock filename test", () => {
    assert.strictEqual(10, mockCodeMap.randomFileName(5, ".java").length);
    assert.strictEqual(10, mockCodeMap.randomFileName(7, ".py").length);
  });
  test("Generate mock file test", () => {
    let coupledTo: number[] = [];
    let file = mockCodeMap.generateFile(10, ".java", 0, coupledTo);
    assert.strictEqual(15, file.name.length);
    assert.strictEqual(0, file.id);
    assert.strictEqual(
      true,
      file.goodToBadCommitRatio <= 1 && file.goodToBadCommitRatio >= 0
    );
  });
  test("Generate mock files test", () => {
    let files: mockCodeMap.FileObject[] = mockCodeMap.mockCodeMapGETRequest(
      100,
      ".java"
    );
    assert.strictEqual(100, files.length);
    //let couplingExists = false;
    for (let i = 0; i < files.length; i++) {
      let file: mockCodeMap.FileObject = files[i];
      assert.strictEqual(
        true,
        file.goodToBadCommitRatio <= 1 && file.goodToBadCommitRatio >= 0
      );
      //let coupledTo: number[] = file.coupledTo;
      //if (coupledTo.length > 0) {
      //couplingExists = true;
      //}
    }
    //assert.strictEqual(true, couplingExists);
  });
  test("Get/set github URL preference test", async () => {
    try {
      await config.setGitUrl("");
    } catch {
      assert.fail("setGitUrl await failed");
    }
    assert.strictEqual(config.getGitUrl(), "");
    try {
      await config.setGitUrl("https://www.github.com/my/repository");
    } catch {
      assert.fail("setGitUrl await failed");
    }
    assert.strictEqual(
      config.getGitUrl(),
      "https://www.github.com/my/repository"
    );
  });
  test("Generate mock knowledge graph", async () => {
    let response = await mockCoauthorshipNetworkGETRequest(20);
    // for (let i = 0; i < response.nodes.length; i++) {
    //   console.log(response.nodes[i].knowledgeScore);
    // }
    // for (let i = 0; i < response.links.length; i++) {
    //   console.log(response.links[i].source);
    // }
    assert.strictEqual(20, response.nodes.length);
  });

  test("Get/set jenkins username preference test", async () => {
    try {
      await config.setCiUsername("");
    } catch {
      assert.fail("setCiUsername await failed");
    }
    assert.strictEqual(config.getCiUsername(), "");
    try {
      await config.setCiUsername("jenkinsbot123");
    } catch {
      assert.fail("setCiUsername await failed");
    }
    assert.strictEqual(config.getCiUsername(), "jenkinsbot123");
  });

  test("Get/set jenkins API key preference test", async () => {
    try {
      await config.setApiKey("");
    } catch {
      assert.fail("setApiKey await failed");
    }
    assert.strictEqual(config.getApiKey(), "");
    try {
      await config.setApiKey("jenkinsbot123");
    } catch {
      assert.fail("setJenkinsPassword await failed");
    }
    assert.strictEqual(config.getApiKey(), "jenkinsbot123");
  });

  test("Get/set jenkins URL preference test", async () => {
    try {
      await config.setJobUrl("");
    } catch {
      assert.fail("setJenkinsURL await failed");
    }
    assert.strictEqual(config.getJobUrl(), "");
    try {
      await config.setJobUrl("https://www.myjenkinsthing.com");
    } catch {
      assert.fail("setJenkinsURL await failed");
    }
    assert.strictEqual(config.getJobUrl(), "https://www.myjenkinsthing.com");
  });
  test("Get/set all jenkins settings test", async () => {
    try {
      await config.setJobUrl("");
    } catch {
      assert.fail("setJenkinsURL await failed");
    }
    try {
      await config.setCiUsername("");
    } catch {
      assert.fail("setJenkinsLogin await failed");
    }
    try {
      await config.setApiKey("");
    } catch {
      assert.fail("setJenkinsPassword await failed");
    }
    let jenkinsSettingsObject = config.getJenkinsSettings();
    assert.strictEqual(jenkinsSettingsObject.ciUsername, "");
    assert.strictEqual(jenkinsSettingsObject.apiKey, "");
    assert.strictEqual(jenkinsSettingsObject.jobUrl, "");
    try {
      await config.setJobUrl("abcdefg.com");
    } catch {
      assert.fail("setJenkinsURL await failed");
    }
    try {
      await config.setCiUsername("beegeesfan1234");
    } catch {
      assert.fail("setJenkinsLogin await failed");
    }
    try {
      await config.setApiKey("securepassword123");
    } catch {
      assert.fail("setJenkinsPassword await failed");
    }
    jenkinsSettingsObject = config.getJenkinsSettings();
    assert.strictEqual(jenkinsSettingsObject.jobUrl, "abcdefg.com");
    assert.strictEqual(jenkinsSettingsObject.ciUsername, "beegeesfan1234");
    assert.strictEqual(jenkinsSettingsObject.apiKey, "securepassword123");
  });
  test("Axios URL get/set test", async () => {
    try {
      await config.setAxiosUrl("https://www.mydeployment.com");
    } catch {
      assert.fail("setAxiosURL await failed");
    }
    assert.strictEqual(config.getAxiosUrl(), "https://www.mydeployment.com");
  });
  test("Get / set filtered authors test", async () => {
    try {
      await config.clearFilteredAuthors();
    } catch {
      assert.fail("clearFilteredAuthors failed");
    }
    assert.strictEqual(config.getAllFilteredAuthors(), "");
    try {
      await config.addFilteredAuthor("mjawad@iu.edu");
    } catch {
      assert.fail("addFilteredAuthor await failed");
    }
    assert.strictEqual(config.getAllFilteredAuthors(), " mjawad@iu.edu");
    try {
      await config.clearFilteredAuthors();
    } catch {
      assert.fail("clearFilteredAuthors failed");
    }
    assert.strictEqual(config.getAllFilteredAuthors(), "");
    try {
      await config.addFilteredAuthor("mjawad@iu.edu");
      await config.addFilteredAuthor("isherfic@iu.edu");
    } catch {
      assert.fail("addFilteredAuthor await failed");
    }
    assert.strictEqual(
      config.getAllFilteredAuthors(),
      " mjawad@iu.edu isherfic@iu.edu"
    );
    try {
      await config.clearFilteredAuthors();
    } catch {
      assert.fail("clearFilteredAuthors failed");
    }
  });
  test("get/set PAT test", async () => {
    let initialPat = config.getPersonalAccessToken();
    try {
      await config.setPersonalAccessToken("");
    } catch {
      assert.fail("setPersonalAccessToken failed");
    }
    assert.strictEqual(config.getPersonalAccessToken(), "");
    let testPat = "hy43u89y587941o5ui4hbjkAA";
    try {
      await config.setPersonalAccessToken(testPat);
    } catch {
      assert.fail("setPersonalAccessToken await failed");
    }
    assert.strictEqual(config.getPersonalAccessToken(), testPat);
    try {
      await config.setPersonalAccessToken(initialPat);
    } catch {
      assert.fail("setPersonalAccessToken await failed");
    }
    assert.strictEqual(config.getPersonalAccessToken(), initialPat);
  });
});
