#!/bin/bash


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
    npm start
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

        echo $INKER_USERNAME;

        # Prompt for username and password
        if [ -z "$INKER_USERNAME" ]; then
            read -p "Enter username: " username
            export INKER_USERNAME="$username"
        fi
        if [ -z "$INKER_PASSWORD" ]; then
            read -sp "Enter password: " password
            export INKER_PASSWORD="$password"
        fi
        echo  # Move to a new line after the password input

        # Deploying Frontend
        if [ "$2" == "frontend" ]; then
            echo "Deploying Frontend..."
            # Build app
            cd frontend && npm run build && cd ../
            # Copy .htaccess to dist
            cp frontend/.htaccess.sample frontend/dist/.htaccess
            sshpass -p "$INKER_PASSWORD" rsync -av -e "ssh -p 2303" frontend/dist/. "$INKER_USERNAME@ahmadasi.li:inker/client"
            echo "Frontend deployed successfully."

        # Deploying Backend
        elif [ "$2" == "backend" ]; then
            echo "Deploying Backend..."
            sshpass -p "$INKER_PASSWORD" rsync -av --delete --exclude='node_modules/' -e "ssh -p 2303" backend/. "$INKER_USERNAME@ahmadasi.li:inker/api"

            # Use sshpass to run npm install on the server
            sshpass -p "$INKER_PASSWORD" ssh -p 2303 "$INKER_USERNAME@ahmadasi.li" 'cd inker/api && npm install'
            echo "Backend deployed successfully."

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
