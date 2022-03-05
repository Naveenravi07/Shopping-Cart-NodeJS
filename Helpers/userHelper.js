var db = require('../config/dbConnect')
var collection = require('../config/dbCollection')
var bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId
const { ObjectId } = require('mongodb')
const { response } = require('express')
const Razorpay = require('razorpay')
const crypto = require('crypto')
require('dotenv').config()



var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});
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
        },

        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
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
  },

  changeProductQuantity: (Details) => {
    let { cart, product, count, quantity } = Details;

    return new Promise(async (resolve, reject) => {
      count = parseInt(count);
      quantity = parseInt(quantity)
      if (count == -1 && quantity == 1) {
        await db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(cart) },
          {
            $pull: { products: { item: objectId(product) } }
          }
        ).then((response) => {
          resolve({ removeProduct: true, })
        })

      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { _id: objectId(cart), 'products.item': objectId(product) },
            {
              $inc: { "products.$.quantity": parseInt(count) },
            }
          )
          .then((response) => {
            console.log("hii" + response);
            resolve({ status: true });
          });
      }

    })
  },
  removeProductFromCart: (details) => {
    let { cartId, proId } = details;
    cartId = parseInt(cartId);
    proId = parseInt(proId);
    return new Promise(async (resolve, reject) => {

      await db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart) },
        {
          $pull: { products: { item: objectId(details.product) } }
        }
      ).then((response) => {
        resolve(response)
      })
    })
  },

  getTotalAmount: (userId) => {
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
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
        },


        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        },

        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$quantity", "$product.price"] } },
          },
        },
      ]).toArray()
      resolve(total[0].total)
    })
  },

  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {

      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      resolve(cart.products)

    })
  },

  placeOrder: async (details, products, total) => {
    return new Promise(async (resolve, reject) => {
      let status = details.paymentmethod === 'COD' ? 'placed' : 'pending'
      console.log(status);
      let orderObj = {
        deliveryDetails: {
          adress: details.adress,
          pincode: details.pincode,
          mobile: details.mobile,
        },
        products: products,
        user: objectId(details.userId),
        paymentMethod: details.paymentmethod,
        date: new Date(),
        totalAmount: total,
        status: status,
      }

      await db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response => {
        db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(details.userId) })
        console.log(response.insertedId);
        resolve(response.insertedId)
      }))

      console.log(orderObj);
    })
  },

  getOrderdProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: { user: objectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity',
            user: '$user',
            date: '$date',
            paymentType: '$paymentMethod',
            totalAmount: '$totalAmount',
            status: '$status',
            deliveryDetails: '$deliveryDetails'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCTS_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },

        {
          $project: {
            item: 1, quantity: 1, total: 1, user: 1, date: 1, paymentType: 1, totalAmount: 1, status: 1, deliveryDetails: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        }
      ]).toArray()
      resolve(orders)
    })
  },

  viewOrderdProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: { _id: objectId(orderId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity',
            user: '$user',
            date: '$date',
            paymentType: '$paymentMethod',
            totalAmount: '$totalAmount',
            status: '$status',
            deliveryDetails: '$deliveryDetails',
          }
        },
        {
          $lookup: {
            from: collection.PRODUCTS_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },

        {
          $project: {
            item: 1, quantity: 1, total: 1, user: 1, date: 1, paymentType: 1, totalAmount: 1, status: 1, deliveryDetails: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        }
      ]).toArray()
      resolve(orders)
      console.log(orders);
    })
  },

  generateRazorpay: (orderId, total) => {
    console.log(orderId);
    return new Promise(async (resolve, reject) => {
      var options = {
        amount: total * 100,
        currency: "INR",
        receipt: "" + orderId,
      }
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          resolve(order)
          console.log(order);
        }
      })
    })
  },

  verifyPayment: (details) => {
    return new Promise(async (resolve, reject) => {

      let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);

      hmac.update(details['response[razorpay_order_id]'] + '|' + details['response[razorpay_payment_id]'])
      hmac = hmac.digest('hex')
      console.log(hmac);

      console.log(details);
      if (hmac == details['response[razorpay_signature]']) {
        resolve({ state: true })
      }

      else {
        reject({ state: false })
      }

    })
  },

  changePaymentStatus: (id) => {
    return new Promise(async (resolve, reject) => {
      console.log(id);
      let item = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(id) }, {
        $set: {
          status: 'placed'
        }
      })
      resolve()
    })
  },
  modalCloseCase: (orderId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.ORDER_COLLECTION).deleteOne({ _id: objectId(orderId) },)
      resolve({ state: true })
    })
  },

  verifyAdminLogin: async (loginData) => {
    let state = {}
    return new Promise(async (resolve, reject) => {
      if (loginData.email == "gamerkidnav@gmail.com" && loginData.password == "123") {
        state.login = true
        state.adminName = "Naveen Admin"
      } else {
        state.login = false
      }
      resolve(state)
    })
  },

  showAllOrdersForAdmin: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
      resolve(orders)
    })
  },

  showAllOrdersWithDetailsForAdmin: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {}
        },
        {
          $unwind: "$products"
        },
        {
          $project: {
            orderId: "$_id",
            pruchaseDate: "$date",
            userId: "$user",
            Adress: "$deliveryDetails.adress",
            pincode: "$deliveryDetails.pincode",
            mobileNumber: "$deliveryDetails.mobile",
            paymentMethod: "$paymentMethod",
            products: "$products.item",
            quantity: "$products.quantity",
            orderTotal: "$totalAmount",
            status: "$status"
          }
        },

        {
          $lookup: {
            from: collection.PRODUCTS_COLLECTION,
            localField: 'products',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $lookup: {
            from: collection.USER_COLLECTION,
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: "$product"
        },
        {
          $unwind: "$user"
        },


      ]).toArray()
      resolve(orders)
    })
  },


}