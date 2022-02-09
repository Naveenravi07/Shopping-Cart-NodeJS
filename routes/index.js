var express = require('express');
var router = express.Router();
var db = require('../config/dbConnect')
var Helpers = require('../Helpers/userHelper')
var productHelpers = require('../Helpers/product-Helpers');
const userHelper = require('../Helpers/userHelper');


//MiddileWare For verify Login

function verifyUserLogin(req, res, next) {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', async function (req, res, next) {

  if (req.session.loggedIn) {
    let cartCount = await Helpers.getCartCount(req.session.user._id)
    let products = await productHelpers.getAllProducts()
    let user = req.session.user
    res.render('index', { user, products, cartCount });

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
    res.redirect('/')
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
  res.redirect('/')
  } else
    res.render('login/signup')
})

//Signup Data Inserting to Db
router.post('/signup', (req, res) => {
  Helpers.doSignup(req.body).then((user) => {
    req.session.loggedIn = true
    req.session.user = user
    res.redirect('/')
  })
})

//Logout
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})


//Add to Cart Router

router.get('/add-to-cart/:id', verifyUserLogin, async (req, res) => {
  let id = req.params.id
  await userHelper.addToCart(id, req.session.user._id).then(() => {
    res.json({ status: true })
  })

})


//Cart Router

router.get('/cart', verifyUserLogin, async (req, res) => {
  let cartItems = Helpers.cartChecker(req.session.user._id).then((response) => {
    if (response.state) {
      let userId = req.session.user._id
      Helpers.getCartProducts(userId).then((products) => {
        res.render('users/cart', { products })
      })
    } else {
      console.log("no Item in cart");
      res.redirect('/')
    }
  })
})

//Profile Router
router.get('/profile', verifyUserLogin, async (req, res) => {
  let userId = req.session.user._id
  let userDetails = Helpers.getProfileDetails(userId)
  res.render('users/profile', { userDetails })
})


//Remove Item from cart

router.get('/removecartitem/:id', verifyUserLogin, async (req, res) => {
  let id = req.params.id
  let userId = await req.session.user._id;
  let cartInfo = await Helpers.deleteCartItem(userId, id).then((response) => {
    res.redirect('/cart')
  })

})
module.exports = router;
