![License MIT](https://img.shields.io/badge/license-MIT-blue.svg)
[![](https://img.shields.io/docker/stars/adamkdean/redirect.svg)](https://hub.docker.com/r/adamkdean/redirect 'DockerHub') [![](https://img.shields.io/docker/pulls/adamkdean/redirect.svg)](https://hub.docker.com/r/adamkdean/redirect 'DockerHub')

# redirect

`adamkdean/redirect` is a lightweight companion container for the nginx-proxy. It allows you to easily redirect hostnames, such as in the case of non-www to www.

## Usage (standalone)

The container can be ran as a standalone container, that either redirects all requests or redirects requests based on a per host basis.

### Single host

To run as single host mode, simply provide a redirection location and (optionally) a status code and preserve url flag. All requests coming into port 80 in this case will be redirected to the location provided.

```
docker run \
  --detach \
  --publish 80:80 \
  --env REDIRECT_STATUS_CODE=307 \
  --env REDIRECT_LOCATION="http://www.example.com" \
  --env PRESERVE_URL=true \
  adamkdean/redirect
```

### Multiple hosts

You can also run in multiple host mode by providing a configuration file mapping source hosts to destinations, and (optionally again) providing a status code and preserve url flag override. The default host file location is `/etc/redirect/hosts.json` but you can override this by setting `HOSTS_FILE_PATH`.

For example, we could omit the environment variables used in the single host mode, and simply map in a configuration file:

```
docker run \
  --detach \
  --publish 80:80 \
  --volume $(pwd)/hosts.json:/etc/redirect/hosts.json \
  adamkdean/redirect
```

where `hosts.json` is a JSON file containing an array of configuration options:

```
[
  {
    "source": "example.com",
    "dest": "www.example.com",
    "preserveUrl": true
  },
  {
    "source": "another-example.com",
    "dest": "www.another-example.com",
    "statusCode": 303
  }
]
```

`source` and `destination` are required, but `preserveUrl` (default: false) and `statusCode` (default: 307) aren't.

#### Overriding host file path

You can use `HOSTS_FILE_PATH` to override the host file path like so:

```
docker run \
  --detach \
  --publish 80:80 \
  --env HOSTS_FILE_PATH=/var/config.json
  --volume $(pwd)/hosts.json:/var/config.json \
  adamkdean/redirect
```


## Usage (nginx-proxy)

It works better if it's used with [nginx-proxy/nginx-proxy](https://github.com/nginx-proxy/nginx-proxy).

With `nginx-proxy` you can expose multiple hostnames like below:

```
version: '2'

services:
  nginx-proxy:
    image: nginx-proxy/nginx-proxy
    ports:
      - 80:80
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro

  example:
    image: example
    environment:
      - VIRTUAL_HOST=example.com,www.example.com
```

Using `adamkdean/redirect`, we can ensure that `www.example.com` is always used.

```
version: '2'

services:
  nginx-proxy:
    image: nginx-proxy/nginx-proxy
    ports:
      - 80:80
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro

  redirect:
    image: adamkdean/redirect
    environment:
      - VIRTUAL_HOST=example.com
      - REDIRECT_LOCATION="http://www.example.com"
      - REDIRECT_STATUS_CODE=301
      - PRESERVE_URL=true

  example:
    image: example
    environment:
      - VIRTUAL_HOST=www.example.com
```

## Configuration

### Single host mode

`REDIRECT_LOCATION` should be set to the uri that you want to redirect to.

`REDIRECT_STATUS_CODE` defaults to 307, but you can set it to:

- `301` for Moved Permanently
- `302` for Found
- `303` for See Other
- `307` for Temporary Redirect

`PRESERVE_URL` can be set to `true` to enable URLs to be preserve. When set to false, requests will redirect to the location, so `https://example.com/posts/24` will redirect to `https://www.example.com/`. When set to true, it will redirect to `https://www.example.com/posts/24` etc.

### Multiple host mode

`HOSTS_FILE_PATH` defaults to `/etc/redirect/hosts.json` but this can be overridden. See above.
