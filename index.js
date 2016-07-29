var spawn = require("child_process").exec
var platform = require('os').platform()
var host = process.env.SEEDSHOT_HOST || "http://seedshot.io/"

module.exports = function(){
  if (/darwin/.test(platform)){
    spawn("screencapture -i screenshot.jpg && " +
          "open $(node -pe '\"" + host + "\" " +
          "+ JSON.parse(process.argv[1]).uuid' " +
          "$(curl -F 'file=@screenshot.jpg' " + host + ")) " +
          "&& rm screenshot.jpg")
  } else if (/freebsd/.test(platform) || /linux/.test(platform)) {
    spawn("scrot -s screenshot.jpg && " +
          "xdg-open $(node -pe '\"" + host + "\" " +
          "+ JSON.parse(process.argv[1]).uuid' " +
          "$(curl -F 'file=@screenshot.jpg' " + host + ")) " +
          "&& rm screenshot.jpg")
  }
}
