var express = require('express');
var router = express.Router();
var db = require('../config/dbConnect')
var Helpers = require('../Helpers/userHelper')
var fs = require('fs')
var collection = require('../config/dbCollection');
var objectId = require('mongodb').ObjectId

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
    },

    deleteProduct: (proId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).deleteOne({ _id: objectId(proId) }).then((response) => {
                resolve(response)
            })

        })
    },

    getProductDetails: (proId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: objectId(proId) }).then((response) => {
                resolve(response)
            })
        })
    },

    updateProduct: async(proId, proDetails) => {
        return new Promise(async (resolve, reject) => {
         await   db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({ _id: objectId(proId) }, {
                $set: {
                    name: proDetails.name,
                    brand: proDetails.brand,
                    description: proDetails.description,
                    price: proDetails.price,
                    category: proDetails.category
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    }
}