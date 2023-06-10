package com.insightservice.springboot.utility;

import com.insightservice.springboot.model.codebase.Codebase;
import com.insightservice.springboot.model.codebase.FileObject;

import java.io.File;
import java.util.*;
import java.util.stream.Collectors;

import static com.insightservice.springboot.Constants.LOG;
import static com.insightservice.springboot.Constants.SEPARATOR;

public class GroupFileObjectUtility {

    // Sorting for TreeSet
    private static final Comparator<FileObject> FILE_OBJECT_COMPARATOR = Comparator.comparing(FileObject::getFilename);

    private GroupFileObjectUtility() {
        //This is a utility class
    }


    /**
     * This method generates groups of FileObjects based on their occurrence over all commits.
     * Each group is the value of the TreeMap, mapped to the hashcode of itself (TreeSet).
     * If FileObject1 and FileObject2 have been frequently appearing in multiple commits, they'd form 1 pair.
     *
     * @param codebase reference of the Codebase object.
     * @return TreeMap of groups formed based on commits. It is sorted in descending order by
     * the number of commits the files were seen together in.
     */
    public static TreeMap<String, TreeSet<FileObject>> groupByCommit(Codebase codebase) {
        LOG.info("Running GroupFileObjectUtility.groupByCommit(...)...");
        HashSet<FileObject> activeFiles = codebase.getActiveFileObjects();
        TreeMap<String, TreeSet<FileObject>> commitGroupedMap =
                new TreeMap<>((o1, o2) -> {
                    int count1 = Integer.parseInt(o1.split(SEPARATOR)[0]);
                    int count2 = Integer.parseInt(o2.split(SEPARATOR)[0]);
                    return count1 != count2 ? Integer.compare(count2, count1) : o1.compareTo(o2);
                });
        TreeSet<FileObject> finalObjects = new TreeSet<>(FILE_OBJECT_COMPARATOR);

        // Outer loop for checking top level commits
        for (FileObject activeFile : activeFiles) {
            if (finalObjects.contains(activeFile)) continue;

            Set<String> activeFileCommits = activeFile.getCommitHashToHeatObjectMap().keySet();
            int maxCommonCommits = 0;
            LinkedHashMap<FileObject, Set<FileObject>> fileObjectSetMap = initObjectSetMap(activeFile);

            // Inner loop for checking top level commit on the rest of commits
            for (FileObject file : activeFiles) {
                if (activeFile.equals(file) || finalObjects.contains(file)) continue;
                Set<String> fileCommits = file.getCommitHashToHeatObjectMap().keySet();
                Set<String> commonCommits = commonElements(activeFileCommits, fileCommits);
                if (commonCommits.size() == 0) continue;
                else if (commonCommits.size() == maxCommonCommits) { // Add to current set of pairs if maxCommonCommits is same
                    fileObjectSetMap.computeIfAbsent(activeFile, k -> Set.of(activeFile)).add(file);
                } else if (commonCommits.size() > maxCommonCommits) { // Replace current pairs if current maxCommonCommits is greater
                    maxCommonCommits = commonCommits.size();
                    fileObjectSetMap.put(activeFile, new HashSet<>(Arrays.asList(activeFile, file)));
                }
            }
            // This is for groups with only a single file
            if (maxCommonCommits == 0) maxCommonCommits = activeFile.getCommitHashToHeatObjectMap().size();

            // Compute degree of external coupling heat
            assignDegreeOfExternalCoupling(activeFile, fileObjectSetMap, activeFiles.size() - 1);

            // Adds to the final list of file objects to maintain the Set of computed File object groups
            finalObjects.addAll(insertGroupsInMap(commitGroupedMap, fileObjectSetMap, maxCommonCommits));
        }

        return commitGroupedMap;
    }

    private static void assignDegreeOfExternalCoupling(
            FileObject activeFile, LinkedHashMap<FileObject, Set<FileObject>> fileObjectSetMap, int totalExternalFiles) {
        Set<FileObject> fileObjectSet = fileObjectSetMap.get(activeFile);
        int degreeOfExternalCoupling = fileObjectSet.size() - 1;

        for (FileObject fileObject: fileObjectSet) {
            //Record file's degreeOfExternalCoupling at the latest commit only
            fileObject.getLatestHeatObject().setDegreeOfCoupling(degreeOfExternalCoupling);
            //System.out.println("Assigned "+fileObject.getFilename()+" degreeOfExternalCoupling = "+degreeOfExternalCoupling);
        }
    }

    private static LinkedHashMap<FileObject, Set<FileObject>> initObjectSetMap(FileObject activeFile) {
        LinkedHashMap<FileObject, Set<FileObject>> fileObjectSetMap = new LinkedHashMap<>();
        fileObjectSetMap.put(activeFile, Set.of(activeFile));
        return fileObjectSetMap;
    }

    private static TreeSet<FileObject> insertGroupsInMap(TreeMap<String, TreeSet<FileObject>> commitGroupedMap,
                                                         LinkedHashMap<FileObject, Set<FileObject>> fileObjectSetMap,
                                                         int maxCommonCommits) {
        TreeSet<FileObject> fileObjects = new TreeSet<>(FILE_OBJECT_COMPARATOR);
        fileObjects.addAll(fileObjectSetMap.values()
                .stream().flatMap(Set::stream).collect(Collectors.toSet()));
        commitGroupedMap.put(getKeyFromSet(fileObjects, maxCommonCommits), fileObjects);
        return fileObjects;
    }

    private static String getKeyFromSet(TreeSet<FileObject> fileObjects, int maxCommonCommits) {
        return maxCommonCommits + SEPARATOR + fileObjects.hashCode();
    }

    private static Set<String> commonElements(Set<String> set1, Set<String> set2) {
        Set<String> resultant = new HashSet<>(set1);
        resultant.retainAll(set2);
        return resultant;
    }

    /**
     * Returns a TreeMap(for sorting capabilities) of package names to the list of files contained in each respective
     * package. Each package name includes only the folders inside the user's project.
     * <br/>
     * Example: If the project root path is "C:\Users\Dummy\my-project" and a FileObject has a path
     * "C:\Users\Dummy\my-project\package1\package2\my-file.java", then the package name for my-file.java
     * will be "\package1\package2\"
     */
    public static TreeMap<String, TreeSet<FileObject>> groupByPackage(String projectRootPath, HashSet<FileObject> activeFiles) {
        // <Package, <Set of Files in package>>
        // TreeMap sorts by string natural order when keys are added
        // TreeSet sorts by comparator below when entries are added to set
        TreeMap<String, TreeSet<FileObject>> packageToFileMap = new TreeMap<>(String::compareTo);

        for (FileObject fileObject : activeFiles) {
            // Obtain the package name by removing the FileObject's absolute path part and file name from its path
            String packageName = fileObject.getPath().toString().replace(projectRootPath, "")
                    .replace(fileObject.getFilename(), "");

            // Add the FileObject under the package name
            packageToFileMap.computeIfAbsent(packageName, k -> new TreeSet<>(FILE_OBJECT_COMPARATOR)).add(fileObject);
        }

        return packageToFileMap;
    }
}
