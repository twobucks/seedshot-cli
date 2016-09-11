"use strict"
const exec = require("child_process").execSync
const platform = require('os').platform()
const path = require('path')
const tmpdir = require('os').tmpdir()
const request = require('request')
const fs = require('fs')

const host = process.env.SEEDSHOT_HOST || 'http://seedshot.io/'
const screenshotPath = path.join(tmpdir, 'screenshot.jpg')
let screenshotCommand = undefined
let openCommand = undefined

function seedshot() {
  if (/darwin/.test(platform)){
    screenshotCommand = "screencapture -i"
    openCommand = "open"
  } else if (/freebsd/.test(platform) || /linux/.test(platform)) {
    screenshotCommand = "scrot -s"
    openCommand = "xdg-open"
  }

  // take the screenshot
  try {
    exec(`${screenshotCommand} ${screenshotPath}`)
  } catch (e){
    // pressing escape or command+c should not throw errors
    return
  }

  // upload screenshot to the server
  request.post({
    url: host,
    formData: { file: fs.createReadStream(screenshotPath)}
  }, (err, httpResponse, body) => {
    if (err) {
      return console.error('upload failed:', err)
    }
    const uuid = JSON.parse(body).uuid
    const imagePath = path.join(host, uuid)
    // open the browser
    exec(`${openCommand} ${imagePath}`)

    // remove the screenshot
    fs.unlink(screenshotPath)
  })

}

module.exports = seedshot
