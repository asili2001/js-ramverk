#!/bin/bash

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
}

frontend() {
    cd frontend || exit 1
    npm i
    checker
    npm run dev
}

backend() {
    cd backend || exit 1
    npm i
    checker
    npm start
}

run() {
    if [ -z "$1" ]; then
        frontend
        backend
    else
        if [ "$1" == "frontend" ]; then
            frontend
        elif [ "$1" == "backend" ]; then
            backend
        else
            echo "Invalid argument. Expected 'frontend' or 'backend'."
            exit 1
        fi
    fi
}

run "$1"
