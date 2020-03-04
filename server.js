//
// The purpose of this is very simple, it accepts an HTTP request
// and redirect all requests to the specified location with the
// specified HTTP status code.
//
// 301 Moved Permanently
// 302 Found
// 303 See Other
// 307 Temporary Redirect
//

const express = require('express')
const app = express()
const port = process.env.HTTP_PORT || 80
const statusCode = parseInt(process.env.REDIRECT_STATUS_CODE) || 307
const preserveUrl = process.env.PRESERVE_URL || false

// Ensure we strip any trailing slashes from REDIRECT_LOCATION
let location = process.env.REDIRECT_LOCATION || ''
if (location.endsWith('/')) location = location.substr(0, location.length - 1)

app.get('*', (req, res) => res.redirect(statusCode, preserveUrl ? location + req.url : location))
app.listen(port, () => {
  console.log(`adamkdean/redirect listening on port ${port}`)
  console.log(`redirecting requests to ${location} with statusCode ${statusCode}`)
})
