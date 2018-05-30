#!/bin/bash

set -e
set -x

timestamp=$(awk 'BEGIN {srand(); print srand()}');
gitRev="$(git rev-parse HEAD)";
filename="slackbot#$gitRev@$timestamp.tar.gz";

# echo "clean all node modules";
# rm -rf node_modules;

echo "clean artefacts";
rm -f *.tar.gz;

echo "install dependency";
npm install;

echo "build";
npm run build;

echo "remove .env";
npm run clean:dotenv;

echo "creat zip file artefact ($filename)";
tar -zcvf $filename .

echo "done => $filename";