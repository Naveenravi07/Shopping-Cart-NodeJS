var express = require('express');
var router = express.Router();
var db = require('../config/dbConnect')
var Helpers = require('../Helpers/userHelper')
var fs = require('fs')
var productHelpers = require('../Helpers/product-Helpers')

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('admin/admin')
});

//Add Products To DB
router.get('/add-products', (req, res) => {
    res.render('admin/add-products')
})


router.post('/add-products', (req, res) => {
    productHelpers.addProduct(req.body).then((data) => {
        let id = data.insertedId
        let image = req.files.image
        image.mv('./public/images/product-images/' + id + '.jpg', (err) => {
            if (!err) {
                res.render('admin/admin')
            } else {
                console.log("err" + err);
            }
        })
    })
})


module.exports = router;
