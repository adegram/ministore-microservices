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
        stage  ('Test') {
            steps {
                dir('services/api-gateway') {
                    sh 'npm test'
                }
            }
        }
    }

}