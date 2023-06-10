package com.insightservice.springboot.model.codebase;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.insightservice.springboot.model.file_tree.RepoTreeNode;
import com.insightservice.springboot.utility.RepositoryAnalyzer;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * FileObjectV2
 * - filename acts as ID
 * - Path path
 * - Map<CommitHash, HeatObject>;
 * - HeatObject has the metrics for this file per commit
 */
public class FileObject implements RepoTreeNode
{
    // region Variables
    @Id
    private Path path;
    private String filename;
    @JsonIgnore
    private LinkedHashMap<String, HeatObject> commitHashToHeatObjectMap;
    private HeatObject latestHeatObject; //heat levels at the latest commit
    private Set<String> uniqueAuthors;
    private Set<String> uniqueAuthorEmails;
    // This would maintain the latest key commit hash added in the map to avoid any traversal again
    @Transient
    @JsonIgnore
    private String latestCommitInTreeWalk; // last time this file appeared in the TreeWalk
    @Transient
    @JsonIgnore
    private String latestCommitInDiffEntryList; // last time this file appeared in the DiffEntry
    // endregion

    // region Constructors
    public FileObject() {
        //Empty constructor
    }

    public FileObject(Path path) {
        this.path = path;
        this.filename = RepositoryAnalyzer.getFilename(this.path.toString());
        this.commitHashToHeatObjectMap = new LinkedHashMap<>();
        this.uniqueAuthors = new LinkedHashSet<>();
        this.uniqueAuthorEmails = new LinkedHashSet<>();
        this.latestCommitInTreeWalk = "";
        this.latestCommitInDiffEntryList = "";
    }
    // endregion


    public Path getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = Paths.get(path);
    }

    public void setPath(Path path) {
        this.path = path;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public Set<String> getUniqueAuthors() {
        return uniqueAuthors;
    }

    public Set<String> getUniqueAuthorEmails() {
        return uniqueAuthorEmails;
    }

    public String getLatestCommitInTreeWalk() {
        return latestCommitInTreeWalk;
    }

    public void setLatestCommitInTreeWalk(String latestCommitInTreeWalk) {
        this.latestCommitInTreeWalk = latestCommitInTreeWalk;
    }

    public String getLatestCommitInDiffEntryList() {
        return latestCommitInDiffEntryList;
    }

    public void setLatestCommitInDiffEntryList(String latestCommitInDiffEntryList) {
        this.latestCommitInDiffEntryList = latestCommitInDiffEntryList;
    }


    // Find/return existing or create new HeatObject for commitHash
    public HeatObject createOrGetHeatObjectAtCommit(String commitHash) {
        HeatObject existingHeatObject = commitHashToHeatObjectMap.get(commitHash);

        if(existingHeatObject != null) {
            return existingHeatObject;
        } else {
            HeatObject newHeatObject = new HeatObject();
            commitHashToHeatObjectMap.put(commitHash, newHeatObject);
            return newHeatObject;
        }
    }

    // Return null if not found
    public HeatObject getHeatObjectAtCommit(String commitHash) {
        return commitHashToHeatObjectMap.get(commitHash);
    }

    public LinkedHashMap<String, HeatObject> getCommitHashToHeatObjectMap() {
        return commitHashToHeatObjectMap;
    }

    public void setHeatForCommit(String commitHash, HeatObject heat) {
        // commitHash already present - was this intentional?
        if (commitHashToHeatObjectMap.putIfAbsent(commitHash, heat) != null) {
            throw new UnsupportedOperationException(String.format("Commit hash %s is already present in %s's commitHashToHeatObjectMap.", commitHash, filename));
        }

        this.latestCommitInTreeWalk = commitHash;
    }

    public HeatObject getLatestHeatObject() {
        return latestHeatObject;
    }

    public void setLatestHeatObject(HeatObject latestHeatObject) {
        this.latestHeatObject = latestHeatObject;
    }

    @Override
    public boolean equals(Object object) {
        if (object != null && object.getClass() == getClass()) {
            FileObject fileObject = (FileObject) object;
            return this.getFilename().equals(fileObject.getFilename());
        }
        return false;
    }

    @Override
    public int hashCode() {
        return super.hashCode();
    }
}
