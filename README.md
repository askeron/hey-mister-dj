# Hey Mister DJ

![node-current](https://img.shields.io/badge/node-%3E%3D%2010.0.0-brightgreen)
![Node.js CI](https://github.com/askeron/hey-mister-dj/workflows/Node.js%20CI%20%2B%20Docker%20Build/badge.svg)
[![Website shields.io](https://img.shields.io/website-up-down-green-red/http/hey-mister-dj.de.svg)](https://hey-mister-dj.de/) [![GitHub license](https://img.shields.io/github/license/askeron/camiacmo.svg)](https://github.com/askeron/camiacmo/blob/master/LICENSE) [![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/askeron/camiacmo/graphs/commit-activity)

## Demo

Try it on [https://hey-mister-dj.de/](https://hey-mister-dj.de/).

The admin interface can be found under https://hey-mister-dj.de/#adminPassword=examplepassword

## How to run

### via node

Run `node index.js --adminPassword=examplepassword` and open it under http://localhost:8080/

### via docker

Run `docker run -p 8080:8080 -e HEY_MISTER_DJ_ADMIN_PASSWORD=examplepassword askeron/hey-mister-dj` and open it under http://localhost:8080/

To run it with persistent storage you need to mount the path `/app/states`, e.g.

`docker run -p 8080:8080 -e HEY_MISTER_DJ_ADMIN_PASSWORD=examplepassword -v /some/path/on/my/disk:/app/states askeron/hey-mister-dj`

