// demo 
pipeline {
    agent any
      tools {nodejs "nodejs"}
     stages{
        stage('Clone Git Repo') {
        /* Checking out to th e repository */
            steps{
                checkout scm
                echo "Successfully cloned git repository"
            }
        }

        stage('Install dependencies') {
        /* Application dependencies installation*/
            steps{
                sh 'npm install'
                echo "Successfully installed npm packages"
            }
		    
	    }

        // stage('Test App') {
        // /* Testing the application */
		//     steps{
        //         // sh 'npm test'
        //     }
	    // }

        // stage('Build Docker Image') {
        // /* Build the docker image */
        //     steps{
        //         script{
        //             dockerImage = docker.build(registry, "${jenkinsAppDir}")
        //         }
        //         echo "Successfully built docker images"
        //     }
        // }

        // stage('Push Image to Dockerhub'){
        // /* Push image to dockerhub */
        //     steps{
        //         script{
        //             docker.withRegistry('https://registry.hub.docker.com', registryCredential ){
        //             dockerImage.push("latest")
        //             }
                    
        //         }
        //         echo "Successfully pushed image to docker hub"
        //     }    
        
        // }

        // stage('Clean Up Disk Space') {
        // /* Removing unused images to clean up disk space */
        //     steps{
        //         sh "docker system prune -af --volumes" 
        //     }
        // }    

        // stage('Kubernetes Cluster Deployment') {
        //     steps{
        //         script{
        //             sshPublisher(
        //                 continueOnError: false, failOnError: true,
        //                 publishers: [
        //                     sshPublisherDesc(
        //                         configName: 'ssh_kubemaster',
        //                         verbose: true,
        //                         transfers: [
        //                             sshTransfer(
        //                                 execCommand: "cd ${kubeDir}; rm -rf ${file_name}*; wget ${githuburl}; kubectl delete deployment,services -l app=${appName}; kubectl apply -f ${file_name}"    
        //                             )
        //                     ])
        //             ])
                
        //         }
        //     }
        // }
    }   
           
}