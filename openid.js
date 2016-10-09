'use strict'

// this module require express server with express session middleware
// es5 compactible version
// require nodejs version > 4.0

var openid = require('openid')
var urljoin = require('url-join')
var parseurl = require('parseurl')

var loginPath = null

var _setup = options => {
  var app = options.app
  var host = options.host
  loginPath = options.path || '/auth/openid'
  var logoutPath = urljoin(loginPath, '/logout')
  var verifyPath = urljoin(loginPath, '/verify')
  var askFor = options.askFor || []
  var askForObj = {}
  for (let i in askFor) {
      askForObj[askFor[i]] = true
  }

  var extensions = [new openid.SimpleRegistration(askForObj)]

  var relyingParty = new openid.RelyingParty(
    urljoin(host, verifyPath)
  , null  // Realm (optional, specifies realm for OpenID authentication)
  , false // Use stateless verification
  , false // Strict mode
  , extensions)


  app.set('strict routing', true)
  app.set('case sensitive routing', true)

  app.get(loginPath, (req, res) => {
    console.log('openid identifier url: %s', options.identifierUrl)
    relyingParty.authenticate(options.identifierUrl, false, (err, authUrl) => {
      if (err) {
        res.send('Authentication failed')
      }
      else if (!authUrl) {
        res.send('Authentication failed')
      }
      else {
        console.log('redirect to authUrl: %s', options.identifierUrl)
        res.redirect(authUrl)
      }
    })
  })

  app.get(verifyPath, (req, res) => {
    relyingParty.verifyAssertion(req, (err, result) => {
      console.log('openid verify assertion')
      if (err || !result.authenticated) {
        res.send('Authentication failed')
        return
      }
      var user = {}
      for (let i in askFor) {
          let field = askFor[i]
          user[field] = req.query['openid.sreg.' + field]
      }
      console.log('Authenticated', user)
      if (!req.session) {
        throw new Error('express-openid should configure after session configuration')  
      }
      req.session.user = user 
      res.redirect(req.session.beforeLoginUrl)
    })
  })
  
  app.get(logoutPath, module.exports.loginRequired, (req, res) => {
    if (!req.session) {
      throw new Error('express-openid should configure after session configuration')  
    }
    if (req.session && req.session.user) {
      delete req.session.user
    }
    res.redirect('/')
  })
}

module.exports = { 
  // use request.session.user to store user identity info
  // this openid middleware require express with session support
  loginRequired: (req, res, next) => {
    if (!req.session) {
      throw new Error('express-openid should configure after session configuration')  
    }
    if (!req.session.user) {
      req.session.beforeLoginUrl = parseurl.original(req).pathname
      res.redirect(loginPath)
    } else {
      next()
    }
  },

  setup: (options) => {
    return _setup(options)
  },
}
