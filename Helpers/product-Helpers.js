var express = require('express');
var router = express.Router();
var db = require('../config/dbConnect')
var Helpers = require('../Helpers/userHelper')
var fs = require('fs')
var collection = require('../config/dbCollection');


module.exports = {
    addProduct: async (data) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).insertOne(data).then((dbData) => {
                resolve(dbData)
            })
        })
    },

    getAllProducts: async () => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCTS_COLLECTION).find().toArray().then((result) => {
                resolve(result)
            })
        })
    }
}