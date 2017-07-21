"use strict"
const exec = require("child_process").execSync
const platform = require('os').platform()
const path = require('path')
const tmpdir = require('os').tmpdir()
const request = require('request')
const fs = require('fs')

const HOST = 'https://zapsnap.io'

function getPlatform() {
  let screenshotCommand = undefined
  let openCommand = undefined

  if (/darwin/.test(platform)){
    screenshotCommand = "screencapture -i"
    openCommand = "open"
  } else if (/freebsd/.test(platform) || /linux/.test(platform)) {
    screenshotCommand = "scrot -s"
    openCommand = "xdg-open"
  }
  return {
    screenshotCommand,
    openCommand
  }
}

function uploadPhoto(host, screenshotPath, openCommand) {
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

function seedshot() {
  const host = process.env.SEEDSHOT_HOST || HOST
  const screenshotPath = path.join(tmpdir, 'screenshot.jpg')
  const platform = getPlatform()
  // take the screenshot
  try {
    exec(`${platform.screenshotCommand} ${screenshotPath}`)
  } catch (e){
    // pressing escape or command+c should not throw errors
    return
  }

  // upload screenshot to the server
  uploadPhoto(host, screenshotPath, platform.openCommand)
}

module.exports = seedshot
