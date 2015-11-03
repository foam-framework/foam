FROM node:0.12
ADD core /foam/core
ADD js /foam/js
ADD tools /foam/tools
ADD node /foam/node
ADD java /foam/java
ADD lib /foam/lib
ADD resources /foam/resources
ADD demos /foam/demos
ADD apps /foam/apps
ADD index.html /foam/index.html
ADD index.js /foam/index.js
CMD cd /foam ; node --harmony tools/foam.js "foam.node.Server" "port=8080" "agents=foam.apps.chatter.Server,foam.demos.olympics.Server"
