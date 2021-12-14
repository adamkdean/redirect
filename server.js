//
// The purpose of this is very simple: it accepts HTTP requests
// and redirect all requests to the specified location with the
// specified HTTP status code.
//
// 301 Moved Permanently
// 302 Found
// 303 See Other
// 307 Temporary Redirect
//

const express = require('express')
const path = require('path')
const fs = require('fs')

async function loadHosts() {
  try {
    const hostPath = process.env.HOSTS_FILE_PATH || '/etc/redirect/hosts.json'
    const hostsData = await fs.promises.readFile(hostPath, 'utf8')
    return JSON.parse(hostsData)
  } catch (e) {
    if (e.code !== 'ENOENT') console.error('error loading hosts file:', e)
    return
  }
}

async function runMultiHost(hosts) {
  const app = express()
  const port = process.env.HTTP_PORT || 80
  const index = {}

  hosts.forEach(host => {
    if (!host.source || !host.destination) {
      console.log(`invalid host: ${host}`)
      return
    }

    // Ensure we strip any trailing slashes from host.destination
    if (host.destination.endsWith('/')) {
      host.destination = host.destination.substr(0, host.destination.length - 1)
    }

    // Ensure defaults are set
    host.statusCode = host.statusCode || 307
    host.preserveUrl = host.preserveUrl || false

    // Add to the index for quick lookup
    index[host.source] = host
    console.log(`+ redirecting ${host.source} to ${host.destination} with statusCode ${host.statusCode}`)
  })

  app.get('*', (req, res, next) => {
    const host = req.headers.host + req.url

    // Handle the host if found
    if (index[host]) {
      let destination = index[host].preserveUrl
        ? index[host].destination + req.url : index[host].destination

      if (destination.substr(0, 4) != 'http')
        destination = `${req.protocol}://${destination}`

      return res.redirect(index[host].statusCode, destination)
    }

    // Otherwise, 404
    next()
  })

  app.listen(port, () => {
    console.log(`adamkdean/redirect listening on port ${port}`)
  })
}

async function runSingleHost() {
  const app = express()
  const port = process.env.HTTP_PORT || 80
  const statusCode = parseInt(process.env.REDIRECT_STATUS_CODE) || 307
  const preserveUrl = process.env.PRESERVE_URL || false

  let location = process.env.REDIRECT_LOCATION || ''
  if (!location) {
    console.error('error: running in single host mode and REDIRECT_LOCATION is not set!')
    process.exit(1)
  }

  // Ensure we strip any trailing slashes from REDIRECT_LOCATION
  if (location.endsWith('/')) location = location.substr(0, location.length - 1)

  app.get('*', (req, res) => res.redirect(statusCode, preserveUrl ? location + req.url : location))
  app.listen(port, () => {
    console.log(`+ redirecting all requests to ${location} with statusCode ${statusCode}`)
    console.log(`adamkdean/redirect listening on port ${port}`)
  })
}

async function main() {
  const hosts = await loadHosts()
  if (hosts) runMultiHost(hosts)
  else runSingleHost()
}

main()
