# Script to start eybot locally on a node 0.12 (current production)
# todo add this to the container 
# appVersion= cat src/appconfig.json | underscore extract appVersion.version 


appName="eybot";

timestamp=$(awk 'BEGIN {srand(); print srand()}');

gitRev="$(git rev-parse HEAD)";

imageName="$appName:$gitRev-$timestamp";


echo "clean artefacts";
rm *.zip;

# remove all images with /eybot/ AND build new one with $imageName
(docker rmi $(docker images | awk '$1 ~ /eybot/ { print $3 }') -f || :) && docker build . -t $imageName -t "$appName:latest"


# echo container build result
echo "[docker build done]";
echo "=> $ docker run -d -p 8000:8000 $imageName";
echo "=> $ docker run -d -p 8000:8000 $appName";
echo "=> $ docker run -it eybot bash"; 

# for example 
# docker run -d -p 8000:8000 eybot:01c7fad9dfcec06e8b7e90f53da597eac7e2f7f7-1486729383 

# then to see running container 
# docker ps

# to stop 
# docker stop [container-id]