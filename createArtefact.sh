#!/bin/bash

set -e
set -x

timestamp=$(awk 'BEGIN {srand(); print srand()}');
gitRev="$(git rev-parse HEAD)";


# echo "clean all node modules";
# rm -rf node_modules;

echo "clean artefacts";
rm -f *.tar.gz;
rm -f *.zip;

echo "install dependency";
npm install;

echo "build";
npm run build;

echo "remove .env";
npm run clean:dotenv;

#filename="slackbot#$gitRev@$timestamp.tar.gz";
filename="slackbot#$gitRev@$timestamp.zip";
echo "creat zip file artefact ($filename)";
zip -r $filename *;
#touch $filename
#tar --exclude=$filename --exclude=".*" -zcvf $filename .

echo "done => $filename";