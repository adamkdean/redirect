# redirect

`adamkdean/redirect` is a lightweight companion container for the nginx-proxy. It allows you to easily redirect hostnames, such as in the case of non-www to www.

## Usage (standalone)

The container can be ran as a standalone container that redirects all requests.

```
docker run \
  --detach \
  --publish 80:80 \
  --env REDIRECT_STATUS_CODE=307 \
  --env REDIRECT_LOCATION="http://www.example.com" \
  adamkdean/redirect
```

## Usage (nginx-proxy)

It works better if it's used with [jwilder/nginx-proxy](https://github.com/jwilder/nginx-proxy).

With `nginx-proxy` you can expose multiple hostnames like below:

```
version: '2'

services:
  nginx-proxy:
    image: jwilder/nginx-proxy
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
    image: jwilder/nginx-proxy
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

  example:
    image: example
    environment:
      - VIRTUAL_HOST=www.example.com
```

## Configuration

`REDIRECT_LOCATION` should be set to the uri that you want to redirect to.

`REDIRECT_STATUS_CODE` defaults to 307, but you can set it to:

- `301` for Moved Permanently
- `302` for Found
- `303` for See Other
- `307` for Temporary Redirect

`PRESERVE_URL` can be set to `true` to enable URLs to be preserve. When set to false, requests will redirect to the location, so `https://example.com/posts/24` will redirect to `https://www.example.com/`. When set to true, it will redirect to `https://www.example.com/posts/24` etc.
