#!/bin/bash

timestamp=$(awk 'BEGIN {srand(); print srand()}');
gitRev="$(git rev-parse HEAD)";
filename="slackbot#$gitRev@$timestamp.zip";


echo "clean all node modules";
rm -rf node_modules;

echo "install dependency";
npm install;

echo "creat zip file artefact ($filename)";
zip -r $filename *;


echo "done";