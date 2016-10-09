
# Express-openid

This is the simplest openid auth module for express framework. Easy configuration and full compactibility.  Use the module according to the following code guide.

## example

```
var express = require('express')
var session = require('express-session')
var RedisStore = require('connect-redis')(session)
var authentication = require('express-openid')

var app = express()

// config session middleware
// the session middleware configuration is just an example, 
// you can configure it in yourself way if you like
app.use(session({
    secret: 'cats and dogs',        // choose whatever a string as secret
    store: new RedisStore({
        host: 'localhost',
        port: 6379,
    }),                             // tell express to store session info in the Redis store, you can choose your own store
    saveUninitialized: true, 
    resave: false,
}))

// config openid
authentication.setup({
    app: app,                       // the express app
    host: 'http://localhost:3000/', // you server address, both ip or domain is ok, the port is the express app's port
    path: '/auth/openid',           // the path you wish to point to the login page
    identifierUrl: 'https://example.openid.com/openid/',  // the openid identifier site
    askFor: ['email', 'fullname'],  // when a user logined, which property you would like to get
})

// register router with loginRequired decorator
app.get('/', authentication.loginRequired, (req, res) => {
    res.send('my name is ' + req.session.user.fullname)  // you can access the field that declared in askFor field
})

// now you can be happy with you express
app.listen(3000)  // whatever port you like

```

**NOTE:** you can logout with 'http://localhost:3000/auth/openid/**logout**', just append `/logout` to the auth url. This router is already registered for you. 

## requirements

* nodejs > 4.0
* express-session middleware

Any question can email to me. `adolli@163.com`


