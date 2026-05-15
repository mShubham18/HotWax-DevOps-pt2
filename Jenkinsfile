pipeline {
  agent any

  environment {
    BACKEND_IMAGE = "monoitachi/hotwax-devops-backend"
    FRONTEND_IMAGE = "monoitachi/hotwax-devops-frontend"
  }

  stages {
    stage("Checkout") {
      steps {
        checkout scm
      }
    }

    stage("Build") {
      parallel {
        stage("Build Backend") {
          steps {
            sh "docker build -t ${BACKEND_IMAGE}:latest -t ${BACKEND_IMAGE}:${BUILD_NUMBER} ./backend"
          }
        }
        stage("Build Frontend") {
          steps {
            sh "docker build -t ${FRONTEND_IMAGE}:latest -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} ./frontend"
          }
        }
      }
    }

    stage("Push") {
      steps {
        withCredentials([usernamePassword(credentialsId: "dockerhub", usernameVariable: "DOCKERHUB_USER", passwordVariable: "DOCKERHUB_PASS")]) {
          sh "echo ${DOCKERHUB_PASS} | docker login -u ${DOCKERHUB_USER} --password-stdin"
          sh "docker push ${BACKEND_IMAGE}:latest"
          sh "docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}"
          sh "docker push ${FRONTEND_IMAGE}:latest"
          sh "docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
        }
      }
    }

    stage("Deploy") {
      steps {
        sh "bash scripts/deploy.sh"
      }
    }
  }

  post {
    always {
      sh "docker logout || true"
    }
  }
}
