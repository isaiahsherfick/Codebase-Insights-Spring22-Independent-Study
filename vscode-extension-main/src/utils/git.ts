import simpleGit, { SimpleGit, CleanOptions } from 'simple-git';

const git: SimpleGit = simpleGit();

export async function getStagedFiles(): Promise<Object> {
    let status =  await git.status();
    return status.staged;
}