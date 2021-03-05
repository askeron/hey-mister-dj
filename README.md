# Hey Mister DJ

[![Website shields.io](https://img.shields.io/website-up-down-green-red/http/hey-mister-dj.de.svg)](https://hey-mister-dj.de/) [![GitHub license](https://img.shields.io/github/license/askeron/camiacmo.svg)](https://github.com/askeron/camiacmo/blob/master/LICENSE) [![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/askeron/camiacmo/graphs/commit-activity)

Try it on [hey-mister-dj.de](https://hey-mister-dj.de/).

Or run it yourself, directly per node or via docker:

Run `docker run -P askeron/hey-mister-dj` and open it under http://localhost:8080/

To run it with persistent storage you need to mount the path `/app/states`, e.g.

`docker run -P -v /some/path/on/my/disk:/app/states askeron/hey-mister-dj`

