pipeline {
    agent any

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
                    sh 'npm install'
                }
            }
        }
    
    }

}