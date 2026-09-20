pipeline {
    agent any
    tools {
        nodejs 'NodeJS 23.0.0'
    }

    stages {
        stage('Clone Github Repository') {
            steps {
                git branch: 'main', changelog: false, poll: false, url: 'https://github.com/adegram/ministore-microservices.git'
                sh 'pwd'
            }
        }
        stage('Build') {
            steps {
                dir('services/api-gateway') {
                    sh 'npm --version'
                    sh 'npm install'
                }
            }
        }
        stage('Docker image Build') {
            steps {
                dir('services/api-gateway') {
                    sh 'docker build -t api-gateway:latest .'
                }
            }
        } //dockerhub-id
        stage('Docker Login') {
            steps { // uses the Username/Password credential we added in Jenkins 
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-id', 
                        usernameVariable: 'DOCKER_USER', 
                        passwordVariable: 'DOCKER_PASS'
                        )
                    ]) { 
                        sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin' 
                } 
            } 
        } 
        stage('Docker Tag and Push') {
            steps {
                dir('services/api-gateway') {
                    sh '''
                    docker tag api-gateway:latest adehorizon/api-gateway:latest
                    docker push adehorizon/api-gateway:latest
                    '''
                }
            }
        }
}
}