#!/bin/bash


axjo() {
    echo "Deploying frontend to axjo21 studentserver..."
    cd frontend || exit 1
    npm i
    npm run build
    rsync -av --delete dist/. axjo21@ssh.student.bth.se:www/editor
}


ahai() {
    echo "Deploying frontend to ahai22 studentserver..."
    cd frontend || exit 1
    npm i
    npm run build
    rsync -av --delete dist/. ahai22@ssh.student.bth.se:www/editor
}


deploy() {
    if [ -z "$1" ]; then
        axjo
        ahai
    else
        if [ "$1" == "axjo" ]; then
            axjo
        elif [ "$1" == "ahai" ]; then
            ahai
        else
            echo "Invalid argument. Expected 'axjo' or 'ahai'."
            exit 1
        fi
    fi
}

deploy "$1"
