#!/bin/bash

# Load variables from .env file
if [ -f .env ]; then
    source .env
else
    echo ".env file not found"
    exit 1
fi


# Function to install sshpass based on the OS
install_sshpass() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # For Debian/Ubuntu
        sudo apt-get update
        sudo apt-get install -y sshpass
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # For macOS (using Homebrew)
        if ! command -v brew &> /dev/null; then
            echo "Homebrew not found. Please install Homebrew first."
            exit 1
        fi
        brew install hudochenkov/sshpass/sshpass
    else
        echo "Unsupported OS. Please install sshpass manually."
        exit 1
    fi
}


gitConflicts() {
    git ls-files -u | grep . > /dev/null 2>&1
}

npmVulnerable() {
    ! npm audit --audit-level=moderate > /dev/null 2>&1
}

checker() {
    # Check for Git conflicts
    if gitConflicts; then
        echo "Conflicts detected! Exiting..."
        exit 1
    fi

    # Run npm audit to check for vulnerabilities
    if npmVulnerable; then
        echo "Vulnerabilities detected! Exiting..."
        exit 1
    fi

    # Lint
    npm run lint || exit
}

run-frontend() {
    cd frontend || exit 1
    npm install
    checker
    npm run dev
}

run-backend() {
    cd backend || exit 1
    npm install
    checker
    npm dev:start
    npm dev:start:socket
}

run() {
    if [ -n "$1" ] && [ "$1" == "run" ]; then
        if [ "$2" == "frontend" ]; then
            echo "Running Frontend"
            run-frontend
        elif [ "$2" == "backend" ]; then
            echo "Running Backend"
            run-backend
        else
            echo "Invalid argument. Expected 'frontend' or 'backend'."
            exit 1
        fi
    fi
}

deploy() {
    if [ -n "$1" ] && [ "$1" == "deploy" ]; then
        install_sshpass  # Ensure sshpass is installed

        # Deploying Frontend
        if [ "$2" == "frontend" ]; then
            echo "Deploying Frontend..."
            # Build app
            cd frontend && rm -rf dist/ && npm run build && cd ../
            # Copy .htaccess to dist
            cp frontend/.htaccess.sample frontend/dist/.htaccess
            sshpass -p "$DEPLOY_SSH_PASSWORD" rsync -av -e "ssh -p 2303" frontend/dist/. "$DEPLOY_SSH_USERNAME@$DEPLOY_SSH_HOST:inker/client"  || { echo "An error occurred"; error_occurred=true; }
            if [ "$error_occurred" = false ]; then
                echo "Frontend deployed successfully."
            fi

        # Deploying Backend
        elif [ "$2" == "backend" ]; then
            echo "Deploying Backend..."
            sshpass -p "$DEPLOY_SSH_PASSWORD" rsync -av --delete --exclude='node_modules/' -e "ssh -p 2303" backend/. "$DEPLOY_SSH_USERNAME@$DEPLOY_SSH_HOST:inker/api"  || { echo "An error occurred"; error_occurred=true; }

            # Use sshpass to run npm install on the server
            sshpass -p "$DEPLOY_SSH_PASSWORD" ssh -p 2303 "$DEPLOY_SSH_USERNAME@$DEPLOY_SSH_HOST" 'cd inker/api && npm install'  || { echo "An error occurred"; error_occurred=true; }
            if [ "$error_occurred" = false ]; then
                echo "Backend deployed successfully."
            fi

        else
            echo "Invalid argument. Expected 'frontend' or 'backend'."
            exit 1
        fi
    else
        echo "Invalid command. Please specify 'deploy' as the first argument."
        exit 1
    fi
}


action() {
    run "$1" "$2"
    deploy "$1" "$2"
}

action "$1" "$2"
