package com.insightservice.springboot.utility.commit_history;

import com.insightservice.springboot.exception.BadBranchException;
import com.insightservice.springboot.exception.BadUrlException;
import com.insightservice.springboot.model.codebase.Codebase;
import com.insightservice.springboot.utility.AuthUtility;
import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.eclipse.jgit.api.CloneCommand;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.Ref;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.eclipse.jgit.transport.CredentialsProvider;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.MalformedURLException;
import java.util.Collection;

import static com.insightservice.springboot.Constants.*;

/**
 * Contains utility methods for opening Git repositories.
 * Credit to the JGit Cookbook for creating this class https://github.com/centic9/jgit-cookbook/tree/master/src/main/java/org/dstadler/jgit/helper
 */
public class JGitHelper
{
    private JGitHelper() {
        //This is a utility class
    }

    private static String getRepositoryNameFromUrl(String remoteUrl) throws MalformedURLException
    {
        //Determine name of new directory
        String[] repoNameArr = remoteUrl.strip().split("/");
        if (repoNameArr.length < 5) //at least 4 slashes are in a Git URL
        {
            throw new MalformedURLException(remoteUrl + " is not a valid repository URL.");
        }
        String repoName = repoNameArr[repoNameArr.length - 1];
        return repoName;
    }

    public static File getPathOfLocalRepository(String remoteUrl) throws MalformedURLException
    {
        String repoName = getRepositoryNameFromUrl(remoteUrl);
        return new File(REPO_STORAGE_DIR + File.separator + repoName);
    }

    public static File cloneRepository(String remoteUrl, String branchName, String personalAccessToken) throws GitAPIException, IOException
    {
        //Make a dir for the cloned repo
        File directory = getPathOfLocalRepository(remoteUrl);
        if (directory.exists())
            FileUtils.deleteDirectory(directory);
        directory.mkdirs();

        //Clone
        LOG.info("Cloning from " + remoteUrl + " to " + directory);

        CredentialsProvider credentialsProvider = createCredentialsProvider(personalAccessToken);

        //If user wants to use default branch (master/main/etc)
        if (branchName.equals(USE_DEFAULT_BRANCH) || branchName.isBlank())
        {
            LOG.info("No branch specified.");

            // if credentials provided
            if(credentialsProvider != null) {

                try (Git result = Git.cloneRepository()
                        //Note lack of setBranch(...) call
                        .setURI(remoteUrl)
                        .setDirectory(directory)
                        .setCredentialsProvider(credentialsProvider)
                        .call()) {
                }
                catch (Exception ex) //handles private and non-existent repos
                {
                    throw new BadUrlException("No repository could be read from your GitHub URL.");
                }
            } else {

                try (Git result = Git.cloneRepository()
                        //Note lack of setBranch(...) call
                        .setURI(remoteUrl)
                        .setDirectory(directory)

                        .call()) {
                }
                catch (Exception ex) //handles private and non-existent repos
                {
                    throw new BadUrlException("No repository could be read from your GitHub URL.");
                }
            }


        }
        //Else, choose specific branch
        else
        {
            LOG.info("Using branch " + branchName);

            // if credentials provided
            if(credentialsProvider != null) {
                try (Git result = Git.cloneRepository()
                        .setBranch(branchName)
                        .setURI(remoteUrl)
                        .setCredentialsProvider(credentialsProvider)
                        .setDirectory(directory)
                        .call()) {
                } catch (Exception ex) //handles private and non-existent repos
                {
                    throw new BadUrlException("No repository could be read from your GitHub URL.");
                }
            } else {
                try (Git result = Git.cloneRepository()
                        .setBranch(branchName)
                        .setURI(remoteUrl)
                        .setDirectory(directory)
                        .call()) {
                } catch (Exception ex) //handles private and non-existent repos
                {
                    throw new BadUrlException("No repository could be read from your GitHub URL.");
                }
            }
        }




        //Ensure files were cloned successfully
        File pathToRepo = JGitHelper.getPathOfLocalRepository(remoteUrl);
        if (!pathToRepo.exists() || pathToRepo.list() == null)
            throw new BadUrlException("Cloning your repository failed for an unknown reason.");
        if (pathToRepo.list().length < 2) //if only the .git folder exists
            throw new BadBranchException("The branch cloned was empty.");

        return directory;
    }

    public static void removeClonedRepository(String remoteUrl) throws IOException
    {
        String repoName = getRepositoryNameFromUrl(remoteUrl);
        //Remove the cloned repo
        FileUtils.deleteDirectory(getPathOfLocalRepository(remoteUrl));
        LOG.info("Removed the repository named `"+repoName+"` from the file system.");
    }

    private static Repository openLocalRepository(File projectPath) throws IOException
    {
        try
        {
            FileRepositoryBuilder builder = new FileRepositoryBuilder();
            return builder
                    .readEnvironment() // scan environment GIT_* variables
                    .findGitDir(projectPath)
                    .build();
        }
        catch (IllegalArgumentException ex)
        {
            throw new FileNotFoundException("openLocalRepository(...) failed. Perhaps the repository was not cloned yet. "
                    + ex.toString());
        }
    }

    public static Repository openLocalRepository(String remoteUrl) throws IOException
    {
        File pathToRepository = getPathOfLocalRepository(remoteUrl);
        assert pathToRepository.exists();

        return openLocalRepository(pathToRepository);
    }

    /**
     * Returns true if the latestCommit of the input
     * Codebase is actually the latest commit on the remote counterpart.
     * This is branch-specific and dependent on the Codebase's activeBranch.
     * @param codebase a codebase that was analyzed on an earlier date and was
     *                 retrieved from the database.
     * @return true if the codebase's latestCommit is, in fact, the latest commit.
     * Returns false for errors, such as the branch not existing on the remote counterpart.
     */
    public static boolean checkIfLatestCommitIsUpToDate(Codebase codebase, String personalAccessToken) throws GitAPIException
    {
        //Validate GitHub url & active branch
        String remoteUrl = codebase.getGitHubUrl();
        assert remoteUrl != null;
        assert !remoteUrl.isBlank();
        String activeBranch = codebase.getActiveBranch();
        assert activeBranch != null;
        assert !activeBranch.isBlank();
        String codebaseLatestCommit = codebase.getLatestCommitHash();
        assert codebaseLatestCommit != null;
        assert !codebaseLatestCommit.isBlank();

        CredentialsProvider credentialsProvider = createCredentialsProvider(personalAccessToken);

        //Obtain latest commit hashes from every branch
        Collection<Ref> refs;
        if (credentialsProvider != null) {
            refs = Git.lsRemoteRepository()
                    .setRemote(remoteUrl)
                    .setCredentialsProvider(credentialsProvider)
                    .call();
        }
        else {
            refs = Git.lsRemoteRepository()
                    .setRemote(remoteUrl)
                    //Note lack of setCredentialsProvider call
                    .call();
        }

        for (Ref ref : refs)
        {
            //Sanity checking
            if (ref.getName() == null || ref.getObjectId() == null)
            {
                LOG.error("Ref `"+ref+"` is corrupt.");
                continue;
            }

            //If latest remote commit == latest codebase commit, then return true
            String remoteBranchName = ref.getName();
            String latestCommitOnBranch = ref.getObjectId().getName();
            if (remoteBranchName.endsWith(activeBranch))
            {
                return codebase.getLatestCommitHash().equals(latestCommitOnBranch);
            }
        }

        LOG.error("checkIfLatestCommitIsUpToDate(...) failed. The branch `" + activeBranch + "` does not exist on the remote repository.");
        return false;
    }

    /**
     * This is the equivalent of running "git pull". It works with whatever branch
     * is currently active for the cloned repo.
     */
    public static void updateLocalRepository(String remoteUrl) throws IOException, GitAPIException {
        LOG.info("Pulling the latest changes for `"+remoteUrl+"`...");
        try (Repository repository = openLocalRepository(remoteUrl)) {
            try (Git git = new Git(repository)) {
                git.pull().call();
            }
        }
    }

    /**
     * Tries to do a git pull to get the latest changes.
     * If that fails, clones the latest version of the repo.
     */
    public static void cloneOrUpdateRepository(String remoteUrl, String branchName, String personalAccessToken) throws GitAPIException, IOException
    {
        try
        {
            //Try to pull
            JGitHelper.updateLocalRepository(remoteUrl);

        }
        catch (IOException | GitAPIException ex)
        {
            //Fresh clone
            LOG.info("git pull failed for repo with URL `"+remoteUrl+"`. Cloning is necessary.");
            JGitHelper.cloneRepository(remoteUrl, branchName, personalAccessToken);
        }
    }

    /**
     * If personalAccessToken is null or "", return null.
     * Otherwise, return a new CredentialsProvider with the personalAccessToken as the password part.
     */
    private static CredentialsProvider createCredentialsProvider(String personalAccessToken)
    {
        CredentialsProvider credentialsProvider = null;
        if (personalAccessToken == null || !personalAccessToken.isEmpty()) {
            // set Auth Utility
            credentialsProvider = new UsernamePasswordCredentialsProvider("PRIVATE-TOKEN", personalAccessToken);
        }
        return credentialsProvider;
    }
}
