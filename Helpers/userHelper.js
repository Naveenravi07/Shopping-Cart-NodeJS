var db = require('../config/dbConnect')
var collection = require('../config/dbCollection')
var bcrypt = require('bcrypt')


module.exports = {

    doLogin: async (loginData) => {
        return new Promise(async (resolve)=>{
            let result={}
            let validPassword

            const user=await db.get().collection(collection.USER_COLLECTION).findOne({email: loginData.email})

            if(!user){
                result.loginStatus=false
            }else{
                validPassword=await bcrypt.compare(loginData.password,user.password)
                if(!validPassword){
                    result.loginStatus=false
                }else {
                    result.user=user
                    result.loginStatus=true
                }
            }
            resolve(result)

        })
    }, 
       doSignup: async (userData) => {
        return new Promise(async (resolve) => {
            userData.password = await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data,err) => {
                if (!err) {
                    resolve(userData)
                }else {
                    throw err
                }
            })
        })
    }
    


}