# Hey Mister DJ

Try it on [hey-mister-dj.de](https://hey-mister-dj.de/).

Or run it yourself, directly per node or via docker:

Run `docker run -P askeron/hey-mister-dj` and open it under http://localhost:8080/

To run it with persistent storage you need to mount the path `/app/states`, e.g.

`docker run -P -v ~/hey-mister-dj/states:/app/states askeron/hey-mister-dj`

