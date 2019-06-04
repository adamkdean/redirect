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
const location = process.env.REDIRECT_LOCATION || ''
const statusCode = process.env.REDIRECT_STATUS_CODE || 307

app.get('*', (req, res) => res.redirect(statusCode, location))
app.listen(port, () => console.log(`adamkdean/redirect ${port}`))
