var db = require('../config/dbConnect')
var collection = require('../config/dbCollection')
var bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId


module.exports = {

    doLogin: async (loginData) => {
        return new Promise(async (resolve) => {
            let result = {}
            let validPassword

            const user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: loginData.email })

            if (!user) {
                result.loginStatus = false
            } else {
                validPassword = await bcrypt.compare(loginData.password, user.password)
                if (!validPassword) {
                    result.loginStatus = false
                } else {
                    result.user = user
                    result.loginStatus = true
                }
            }
            resolve(result)

        })
    },
    doSignup: async (userData) => {
        return new Promise(async (resolve) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data, err) => {
                if (!err) {
                    resolve(userData)
                } else {
                    throw err
                }
            })
        })
    },

    addToCart: async (proId, userId) => {
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })

            if (!userCart) {

                let cartObj = {
                    user: objectId(userId),
                    products: [objectId(proId)]
                }

                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    console.log(response);
                    resolve(response)
                })


            } else {
                await db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
                    {
                        $push: { products: objectId(proId) }
                    }).then(() => {
                        resolve()
                    })
            }
        })
    },
    
    cartChecker:async(userId)=>{
      let cart={}
        return new Promise(async(resolve,reject)=>{
            let ItemInCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(ItemInCart){
                cart.state=true;
            }else{
                cart.state=false;
            }
            resolve(cart)
        })
    },

    getCartProducts:async (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        let:{proList:'$products'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $in:['$_id',"$$proList"]
                                    }
                                }
                            }
                        ],
                        as:'cartItems'
                    }
                }
            ]).toArray()
                resolve(cartItems[0].cartItems)
        })
    },


}