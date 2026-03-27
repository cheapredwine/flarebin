# cf-httpbin

A [httpbin.org](https://httpbin.org)-compatible HTTP testing service running on [Cloudflare Workers](https://workers.cloudflare.com). No servers, no containers — just a Worker deployed globally on Cloudflare's edge.

**Live:** `https://cf-httpbin.jsherron-test-account.workers.dev`

## Endpoints

### HTTP Methods

| Endpoint | Method | Description |
|---|---|---|
| `/get` | GET | Returns GET request data |
| `/post` | POST | Returns POST request data |
| `/put` | PUT | Returns PUT request data |
| `/delete` | DELETE | Returns DELETE request data |
| `/patch` | PATCH | Returns PATCH request data |
| `/anything` | ANY | Returns any request data |

### Request Inspection

| Endpoint | Description |
|---|---|
| `/headers` | Returns request headers |
| `/ip` | Returns requester's IP (via `cf-connecting-ip`) |
| `/user-agent` | Returns user-agent string |

### Response Formats

| Endpoint | Description |
|---|---|
| `/json` | Returns sample JSON |
| `/html` | Returns sample HTML |
| `/xml` | Returns sample XML |
| `/robots.txt` | Returns robots.txt |
| `/deny` | Returns a page that should be denied |
| `/encoding/utf8` | Returns a UTF-8 encoded page |

### Status Codes

| Endpoint | Description |
|---|---|
| `/status/:code` | Returns the given HTTP status code |

Comma-separate codes for random selection: `/status/200,404,500`

### Redirects

| Endpoint | Description |
|---|---|
| `/redirect/:n` | 302 redirects n times |
| `/absolute-redirect/:n` | Absolute 302 redirects n times |
| `/relative-redirect/:n` | Relative 302 redirects n times |
| `/redirect-to?url=&status_code=` | Redirects to given URL |

### Delays

| Endpoint | Description |
|---|---|
| `/delay/:seconds` | Delays response by n seconds (max 10) |

### Auth

| Endpoint | Description |
|---|---|
| `/basic-auth/:user/:pass` | HTTP Basic Auth challenge |
| `/bearer` | Bearer token auth challenge |

### Cookies

| Endpoint | Description |
|---|---|
| `/cookies` | Returns current cookies |
| `/cookies/set?name=value` | Sets cookies via redirect |
| `/cookies/delete?name=` | Deletes cookies via redirect |

### Streaming

| Endpoint | Description |
|---|---|
| `/stream/:n` | Streams n newline-delimited JSON objects (max 100) |
| `/stream-bytes/:n` | Streams n random bytes (max 100KB) |

## Examples

```bash
BASE=https://cf-httpbin.jsherron-test-account.workers.dev

# GET reflection
curl $BASE/get

# POST with JSON body
curl -X POST $BASE/post \
  -H "Content-Type: application/json" \
  -d '{"hello": "world"}'

# POST with form data
curl -X POST $BASE/post \
  -d "foo=bar&baz=qux"

# Your IP as seen by Cloudflare
curl $BASE/ip

# Request headers
curl $BASE/headers

# Specific status code
curl -I $BASE/status/418

# Random status code
curl -I $BASE/status/200,404,500

# 2 second delay
curl $BASE/delay/2

# Redirect 3 times
curl -L $BASE/redirect/3

# Redirect to a URL
curl -L "$BASE/redirect-to?url=https://cloudflare.com"

# Basic auth (correct credentials)
curl -u myuser:mypass $BASE/basic-auth/myuser/mypass

# Bearer token
curl -H "Authorization: Bearer mytoken" $BASE/bearer

# Set a cookie and read it back
curl -c cookies.txt "$BASE/cookies/set?foo=bar"
curl -b cookies.txt $BASE/cookies

# Stream 5 JSON lines
curl $BASE/stream/5

# Stream 1024 random bytes
curl $BASE/stream-bytes/1024
```

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Deploy
npm run deploy
```

Requires [Node.js](https://nodejs.org) and a [Cloudflare account](https://dash.cloudflare.com/sign-up).

## Deployment

This Worker deploys automatically to Cloudflare Workers via the Cloudflare Dashboard on every push to `main`.

## Notes

- `/ip` uses `cf-connecting-ip` so you get the real client IP, not a proxy IP
- `/delay` is capped at 10 seconds
- `/stream-bytes` is capped at 100KB
- Streaming responses use `ReadableStream` natively in the Workers runtime
