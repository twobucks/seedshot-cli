var exec = require("child_process").execSync
var platform = require('os').platform()
var path = require('path')
var tmpdir = require('os').tmpdir()
var request = require('request')
var fs = require('fs')

var host = process.env.SEEDSHOT_HOST || 'http://seedshot.io/'
var screenshotPath = path.join(tmpdir, 'screenshot.jpg')
var screenshotCommand = undefined
var openCommand = undefined

module.exports = function(){
  if (/darwin/.test(platform)){
    screenshotCommand = "screencapture -i"
    openCommand = "open"
  } else if (/freebsd/.test(platform) || /linux/.test(platform)) {
    screenshotCommand = "scrot -s"
    openCommand = "xdg-open"
  }

  // take the screenshot
  exec(screenshotCommand + " " + screenshotPath)

  // upload screenshot to the server
  request.post({
    url: host,
    formData: { file: fs.createReadStream(screenshotPath)}
  }, function(err, httpResponse, body){
    if (err) {
      return console.error('upload failed:', err)
    }
    var uuid =  JSON.parse(body).uuid

    // open the browser
    exec(openCommand + " " + path.join(host, uuid))

    // remove the screenshot
    fs.unlink(screenshotPath)
  })
}
