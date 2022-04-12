var express = require('express');
var router = express.Router();
var db = require('../config/dbConnect')
var Helpers = require('../Helpers/userHelper')
var fs = require('fs')
var productHelpers = require('../Helpers/product-Helpers');
const userHelper = require('../Helpers/userHelper');
const {response} = require('express');


router.get('/', async function (req, res, next) {
    if (req.session.adminLoginStatus) {
        let products = await productHelpers.getAllProducts().then((items) => {
            let admin = req.session.admin
            res.render('admin/admin', {items, admin})
        })
    } else {
        res.redirect('/admin/login')
    }
});

router.get('/login', async (req, res) => {

    console.log(req.session.adminLoginStatus);
    if (req.session.adminLoginStatus) {
        res.redirect('/admin')
    } else 
        res.render('login/admin-login')
    
})

router.post('/login', async (req, res) => {
    console.log(req.body);
    await userHelper.verifyAdminLogin(req.body).then((status) => {
        console.log(status);
        if (status.login) {
            req.session.adminLoginStatus = true
            req.session.admin = status.adminName
            res.redirect('/admin')
        } else {
            req.session.adminLoginStatus = false
            res.redirect('/admin/login')

        }
    })
})

router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

// Add Products To DB
router.get('/add-products', (req, res) => {
    res.render('admin/add-products')
})


router.post('/add-products', (req, res) => {
    let datainsert = req.body
    datainsert.status = 'Preparing for shipping'
    datainsert.price = parseInt(datainsert.price)
    productHelpers.addProduct(datainsert).then((data) => {
        let id = data.insertedId
        let image = req.files.image
        image.mv('./public/images/product-images/' + id + '.jpg', (err) => {
            if (!err) {
                res.redirect('/admin')
            } else {
                console.log("err" + err);
            }
        })
    })
})

// Edit Product Router

router.get('/edit-product/:id', (req, res) => {
    let proId = req.params.id
    productHelpers.getProductDetails(proId).then((product) => {
        res.render('admin/edit-product', {product})
    })

})

router.post('/edit-product/:id', (req, res) => {
    let proId = req.params.id
    productHelpers.updateProduct(proId, req.body).then((response) => {
        if (req.files) {
            let image = req.files.image
            fs.unlink("./public/images/product-images/" + proId + ".jpg", (error) => {
                if (error) 
                    throw error
                
                console.log("error" + error);
            })
            image.mv('./public/images/product-images/' + proId + ".jpg", (err) => {
                if (err) {
                    console.log("error while adding image " + err);
                } else {
                    res.redirect('/admin')
                }
            })
        } else {
            res.redirect('/admin')
        }
    })
})

// Delete Product Router

router.get('/delete-product/:id', (req, res) => {
    let proId = req.params.id
    productHelpers.deleteProduct(proId).then((response) => {
        res.redirect('/admin')
    })
    fs.unlink("./public/images/product-images/" + proId + ".jpg", (error) => {
        if (error) 
            throw error
        
    })

})

router.get('/manage-users', async (req, res) => {
    let user = await Helpers.getAllUsers().then((users) => {
        res.render('admin/all-users', {users})
    })
})

router.get('/delete-user/:id', async (req, res) => {
    let userid = req.params.id
    await Helpers.deleteUser(userid).then((response) => {
        res.redirect('/admin/manage-users')
    })
})

router.get('/all-orders', async (req, res) => {
    let orders = await Helpers.showAllOrdersWithDetailsForAdmin()
    console.log(orders);
    res.render('admin/all-orders', {orders})
})

router.post('/shipItem', async (req, res) => {
    console.log(req.body)
    let proId = req.body.proId
    let orderId = req.body.orderId
    let response = await productHelpers.shipItem(proId, orderId)
    console.log(response);
    res.json(response)
})

router.get('/test',(req,res)=>{
    res.render('admin/dashboard')
})
module.exports = router;

