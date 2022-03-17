var express = require('express');
var router = express.Router();
var db = require('../config/dbConnect')
var Helpers = require('../Helpers/userHelper')
var productHelpers = require('../Helpers/product-Helpers');
const userHelper = require('../Helpers/userHelper');
const e = require('express');
const {route} = require('./admin');


// MiddileWare For verify Login

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
        res.render('index', {user, products, cartCount});

    } else {
        let products = await productHelpers.getAllProducts()
        let user = req.session.user
        res.render('index', {products})

    }
});

// Login Page
router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        let user = req.session.user
        res.redirect('/')
    } else {
        res.render('login/login', {"loginErr": req.session.loginErr})
        req.session.loginErr = null
    }

})

// Login Data Verification
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
// Signup

router.get('/signup', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/')
    } else 
        res.render('login/signup')


    


})

// Signup Data Inserting to Db
router.post('/signup', (req, res) => {
    Helpers.doSignup(req.body).then((user) => {
        req.session.loggedIn = true
        req.session.user = user
        res.redirect('/')
    })
})

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})


// Add to Cart Router

router.get('/add-to-cart/:id', verifyUserLogin, async (req, res) => {
    let id = req.params.id
    await userHelper.addToCart(id, req.session.user._id).then(() => {
        res.json({status: true})
    })

})

// Cart Router

router.get('/cart', verifyUserLogin, async (req, res) => {
    let cartItems = Helpers.cartChecker(req.session.user._id).then((response) => {
        if (response.state) {
            let userId = req.session.user._id
            let user = req.session.user
            Helpers.getCartCount(userId).then((cartCount) => {
                console.log(cartCount);
                if (cartCount > 0) {
                    Helpers.getCartProducts(userId).then((products) => {
                        userHelper.getTotalAmount(userId).then((total) => {
                            res.render('users/cart', {products, cartCount, user, total})
                        })
                    })
                } else {
                    res.redirect('/')
                }
            })

        } else {
            console.log("no Item in cart");
            res.redirect('/')
        }
    })
})


// Profile Router
router.get('/profile', verifyUserLogin, async (req, res) => {
    let userId = req.session.user._id
    console.log(userId);
    let user = Helpers.getProfileDetails(userId).then((user) => {
        res.render('users/profile', {user})
    })

})

router.get('/edit-profile/:id', (req, res) => {
    let userId = req.params.id
    let user = req.session.user
    console.log("Hii" + userId)
    Helpers.getProfileDetails(userId).then((user) => {
        res.render('users/edit-profile', {user})
    })
})

router.post('/edit-profile', async (req, res) => {
    let userId = req.body.id
    console.log(req.body);

    if (req.body) {
        await userHelper.changeProfileDetails(req.body).then((response) => {
            console.log(response);
        })

    } else {
        console.log("err");
    }
    if (req.files) {
        let image = req.files.image
        Helpers.addProfilePicState(userId).then((response) => {
            console.log(response);
        })
        image.mv('./public/images/profile-pics/' + userId + '.jpg', (err) => {
            if (!err) {
                res.redirect('/profile')
            } else {
                console.log("err" + err);
            }
        })
        console.log(image);
    } else {
        res.redirect('/profile')
    }
})

router.post('/remove-profilepic', (req, res) => {
    console.log(req.body);

})


// Remove Item from cart

router.get('/removecartitem/:id', verifyUserLogin, async (req, res) => {
    let id = req.params.id
    let userId = await req.session.user._id;
    let cartInfo = await Helpers.deleteCartItem(userId, id).then((response) => {
        res.redirect('/cart')
    })

})
// Change Product Quantity
router.post('/change-product-quantity', async (req, res) => {
    let Details = req.body
    Details.user = req.session.user._id
    console.log(req.body);

    await Helpers.changeProductQuantity(Details).then(async (response) => {
        console.log(response);
        if (response.removeProduct) {
            res.json(response)
        } else {
            let total = await userHelper.getTotalAmount(req.session.user._id)
            response.total = total;
            res.json(response)
        }
    })
})

// Remove Product From Cart

router.post('/remove-product-fromcart', async (req, res) => {
    console.log(req.body);
    await userHelper.removeProductFromCart(req.body).then((response) => {
        console.log(response);
        res.json(response)
    })
})

// Place Order
router.get('/place-order', verifyUserLogin, async (req, res) => {
    let userId = req.session.user._id
    let user = req.session.user
    console.log("haiii");
    let cartCount = await userHelper.getCartCount(userId)
    console.log(cartCount);
    if (cartCount > 0) {
        let total = await userHelper.getTotalAmount(userId)
        res.render('users/place-order', {total, user, cartCount})
    } else {
        res.redirect('/')
    }

})


router.post('/place-order', async (req, res) => {
    let products = await userHelper.getCartProductList(req.body.userId)
    let totalAmount = await userHelper.getTotalAmount(req.body.userId)
    await userHelper.placeOrder(req.body, products, totalAmount).then((orderId) => {
        console.log(req.body);
        if (req.body.paymentmethod === "COD") {
            res.json({status: "COD"})
        } else {
            userHelper.generateRazorpay(orderId, totalAmount).then((response) => {
                console.log(response);
                res.json(response)
            })
        }
    })


})

router.get('/orders', verifyUserLogin, async (req, res) => {
    let cartCount = await Helpers.getCartCount(req.session.user._id)
    await userHelper.getOrderdProducts(req.session.user._id).then((orders) => {
        let user = req.session.user
        console.log(orders);
        console.log(orders.deliveryDetails);
        res.render('users/orders', {orders, user, cartCount})
    })

})

router.get('/view-order-product/:id', (req, res) => {
    let id = req.params.id
    console.log(id);
    userHelper.viewOrderdProducts(id).then((orders) => {
        console.log(orders);
        res.render('users/view-order-products', {orders, user: req.session.user})
    })
})

router.post('/verify-payment', async (req, res) => {
    console.log(req.body);
    await userHelper.verifyPayment(req.body).then(() => {
        userHelper.changePaymentStatus(req.body['order[receipt]']).then(() => {
            res.json({success: true})
        })
    })
})
router.post('/manage-dismiss', async (req, res) => {
    console.log(req.body.orderId);
    await userHelper.modalCloseCase(req.body.orderId).then((response) => {
        res.json(response)
    })
})

router.get('/test', (req, res) => {
    res.render('users/test')
})
module.exports = router;
