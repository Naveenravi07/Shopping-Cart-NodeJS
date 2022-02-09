var db = require('../config/dbConnect')
var collection = require('../config/dbCollection')
var bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId
const { ObjectId } = require('mongodb')


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

  addToCart: async (details, userId) => {
    const id = details;
    let proObj = {
      item: objectId(id),
      quantity: 1,
    };

    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let prodExist = await userCart.products.findIndex(
          products => products.item == id
        );

        if (prodExist != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(id) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then((response) => {
              resolve("inc");
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((response) => {
              resolve(true);
            });
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },



  cartChecker: async (userId) => {
    let cart = {}
    return new Promise(async (resolve, reject) => {
      let ItemInCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      if (ItemInCart) {
        cart.state = true;
      } else {
        cart.state = false;
      }
      resolve(cart)
    })
  },

  getCartProducts: async (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: objectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCTS_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        }
      ]).toArray()
      resolve(cartItems)
    })
  },

  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartCount = 0
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      if (cart) {
        cartCount = cart.products.length
      }
      resolve(cartCount)
    })
  },

  getProfileDetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collection.USER_COLLECTION).
        findOne({ _id: objectId(userId) })
      console.log(user);
      resolve(user)
    })
  },

  deleteCartItem: async (userId, proId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
        {
          $pull: { products: { item: objectId(proId) } }
        }
      )
      resolve()
    })
  },

  getAllUsers: async () => {
    return new Promise(async (resolve, reject) => {
      let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
      resolve(users)

    })
  },

  deleteUser: async (userId) => {
    let state = {}
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      let userDeleted = await db.get().collection(collection.USER_COLLECTION).deleteOne({ _id: objectId(userId) })
      state.user = true
      if (userDeleted) {
        await db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(userId) })
        state.cart = true
      } else {
        state.cart = fale
      }
      resolve(state)
    })
  }


}