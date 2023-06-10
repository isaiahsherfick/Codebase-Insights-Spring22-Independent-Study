package com.insightservice.springboot.model.knowledge;

import java.util.ArrayList;

public class KnowledgeGraph
{
    private int totalLinesInCodebase; //the sum of knowledge scores for all authors in the codebase
    private int totalFilesInCodebase; //how many files are in the codebase
    private ArrayList<Contributor> contributorList = new ArrayList<>();
    private ArrayList<ContributorLink> links = new ArrayList<>();

    public KnowledgeGraph() {
    }


    public int getTotalLinesInCodebase() {
        return totalLinesInCodebase;
    }

    public void setTotalLinesInCodebase(int totalLinesInCodebase) {
        this.totalLinesInCodebase = totalLinesInCodebase;
    }

    public int getTotalFilesInCodebase() {
        return totalFilesInCodebase;
    }

    public void setTotalFilesInCodebase(int totalFilesInCodebase) {
        this.totalFilesInCodebase = totalFilesInCodebase;
    }

    /**
     * FOR USE BY JSON OBJECTMAPPER ONLY
     */
    public ArrayList<Contributor> getContributorList() {
        return contributorList;
    }

    /**
     * FOR USE BY JSON OBJECTMAPPER ONLY
     */
    public ArrayList<ContributorLink> getLinks() {
        return links;
    }



    public void addContributor(String email, int knowledgeScore)
    {
        int id = contributorList.size(); //auto-generate an ID
        contributorList.add(new Contributor(id, email, knowledgeScore));
    }

    public void addContributor(Contributor contributor)
    {
        contributorList.add(contributor);
    }

    public void setLink(int source, int target)
    {
        //Check if link is already in list
        for (ContributorLink existingLink : links)
        {
            //Check for both directions (it's an undirected graph)
            if ((existingLink.getSource() == source && existingLink.getTarget() == target) ||
                    (existingLink.getSource() == target && existingLink.getTarget() == source))
            {
                //Increment strength of link
                existingLink.setStrength(existingLink.getStrength() + 1);
                return;
            }
        }

        //Else, insert new link
        links.add(new ContributorLink(source, target));
    }
}
