var express = require('express');
var router = express.Router();
var db = require('../config/dbConnect')
var Helpers = require('../Helpers/userHelper')

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.loggedIn) {
    let user = req.session.user
    res.render('index', { user });
  } else {
    res.render('index')
  }

});

//Login Page
router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    let user = req.session.user
    res.render('index', { user })
  } else
    res.render('login/login')
})

//Login Data Verification
router.post('/login', (req, res) => {
  Helpers.doLogin(req.body).then((state) => {
    if (state.loginStatus) {
      user = state.user
      req.session.loggedIn = true;
      res.render('index', { user })
    } else {
      res.render('login/login')
    }
  })
})

//Signup

router.get('/signup', (req, res) => {
  if (req.session.loggedIn) {
    let user = req.session.user
    res.render('index', { user })
  } else
    res.render('login/signup')
})

//Signup Data Inserting to Db
router.post('/signup', (req, res) => {
  Helpers.doSignup(req.body).then((user) => {
    req.session.loggedIn = true
    req.session.user = user
    res.render('index', { user })
  })
})

//Logout
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.render('index')
})
  
module.exports = router;
