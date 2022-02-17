var express = require('express');
var router = express.Router();
var db = require('../config/dbConnect')
var Helpers = require('../Helpers/userHelper')
var fs = require('fs')
var productHelpers = require('../Helpers/product-Helpers');


router.get('/', async function (req, res, next) {
    let products = await productHelpers.getAllProducts().then((items) => {
        res.render('admin/admin', { items })
    })
});

//Add Products To DB
router.get('/add-products', (req, res) => {
    res.render('admin/add-products')
})


router.post('/add-products', (req, res) => {
    let datainsert = req.body
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

//Edit Product Router

router.get('/edit-product/:id', (req, res) => {
    let proId = req.params.id
    productHelpers.getProductDetails(proId).then((product) => {
        res.render('admin/edit-product', { product })
    })

})

router.post('/edit-product/:id', (req, res) => {
    let proId = req.params.id
    productHelpers.updateProduct(proId, req.body).then((response) => {
        if (req.files) {
            let image = req.files.image
            fs.unlink("./public/images/product-images/" + proId + ".jpg", (error) => {
                if (error) throw error
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

//Delete Product Router

router.get('/delete-product/:id', (req, res) => {
    let proId = req.params.id
    productHelpers.deleteProduct(proId).then((response) => {
        res.redirect('/admin')
    })
    fs.unlink("./public/images/product-images/" + proId + ".jpg", (error) => {
        if (error) throw error
    })

})

router.get('/manage-users', async (req, res) => {
    let user = await Helpers.getAllUsers().then((users) => {
        res.render('admin/all-users', { users })
    })
})

router.get('/delete-user/:id', async (req, res) => {
    let userid = req.params.id
    await Helpers.deleteUser(userid).then((response) => {
        res.redirect('/admin/manage-users')
    })
})
module.exports = router;
