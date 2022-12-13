const ftpd = require('ftpd')
const fs = require('fs')
const path = require('path')
const uploadDocumentToAzure = require("./push_to_blob")
const { Server } = require('http')
require('dotenv').config()

var keyFile
var certFile
var server

// use the IP and PORT from the .env file or default to localhost:21
var options = {
  host: process.env.IP || '127.0.0.1',
  port: process.env.PORT || 21,
  tls: null,
}

// Check if SSL KEY / CERT are provided ELSE start without SSL support
if (process.env.KEY_FILE && process.env.CERT_FILE) {
  console.log('Running as FTPS server')
  if (process.env.KEY_FILE.charAt(0) !== '/') {
    keyFile = path.join(__dirname, process.env.KEY_FILE)
  }
  if (process.env.CERT_FILE.charAt(0) !== '/') {
    certFile = path.join(__dirname, process.env.CERT_FILE)
  }
  options.tls = {
    key: fs.readFileSync(keyFile),
    cert: fs.readFileSync(certFile),
    ca: !process.env.CA_FILES
      ? null
      : process.env.CA_FILES.split(':').map(function (f) {
          return fs.readFileSync(f)
        }),
  }
} else {
  console.log()
  console.log('###### To run as FTPS server, #####')
  console.log('### set "KEY_FILE", "CERT_FILE" ###')
  console.log('###### or "CA_FILES" env vars. ####')
  console.log()
}

// get ftp root directory listing
server = new ftpd.FtpServer(options.host, {
  getInitialCwd: function () {
    return '/ftproot'
  },
  getRoot: function () {
    return process.cwd()
  },
  pasvPortRangeStart: 1025,
  pasvPortRangeEnd: 1050,
  tlsOptions: options.tls,
  allowUnauthorizedTls: true,
  useWriteFile: true,
  useReadFile: false,
  uploadMaxSlurpSize: 7000, // N/A unless 'useWriteFile' is true.
  allowedCommands: [
    'XMKD',
    'AUTH',
    'TLS',
    'SSL',
    'USER',
    'PASS',
    'PWD',
    'OPTS',
    'TYPE',
    'PORT',
    'PASV',
    'LIST',
    'CWD',
    'MKD',
    'SIZE',
    'STOR',
    'MDTM',
    'DELE',
    'QUIT',
  ],
})

server.on('error', function (error) {
  console.log('FTP Server error:', error)
})
server.on('client:port', ()=>{

  console.log('client sored')
})
// verify user and password from .env file
server.on('client:connected', async function  (connection) {
  var username = null
  
  console.log('client connected: ' + connection.remoteAddress)
    
  connection.on('command:user', function (user, success, failure) {
    if (user) {
      username = process.env.USER
      console.log("user loged in")
      //func()
      success()
     
    } else {
      failure()
    }
  })

  connection.on('command:pass',async function (pass, success, failure) {
    if (process.env.PWD) {
      success(username)
    } else {
      failure()
    }
  })   
  connection.on('file:stor', async ()=>{
    console.log("file")
    await uploadDocumentToAzure()
  })     
})




server.debugging = 4
server.listen(options.port)
console.log('Listening on port ' + options.port)
console.log('Listening on host ' + options.host)

//0D0Ygz9LBp/nsBFd65EiBoVGYglQhkCB