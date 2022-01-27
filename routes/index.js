var express = require('express');
var router = express.Router();
var db = require('../config/dbConnect')
var Helpers = require('../Helpers/userHelper')
var productHelpers = require('../Helpers/product-Helpers')

/* GET home page. */
router.get('/', async function (req, res, next) {

  if (req.session.loggedIn) {
    let products = await productHelpers.getAllProducts()
    let user = req.session.user
    res.render('index', { user, products });

  } else {
    let products = await productHelpers.getAllProducts()
    let user = req.session.user
    res.render('index', { products })

  }
});

//Login Page
router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    let user = req.session.user
    res.render('index', { user })
  } else {
    res.render('login/login', { "loginErr": req.session.loginErr })
    req.session.loginErr = null
  }

})

//Login Data Verification
router.post('/login', (req, res) => {
  Helpers.doLogin(req.body).then((state) => {
    if (state.loginStatus) {
      req.session.user = state.user
      let user = req.session.user
      req.session.loggedIn = true;
      res.redirect('/')
    } else {
      req.session.loginErr = true
      res.redirect('/login')
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
  res.redirect('/')
})

module.exports = router;
