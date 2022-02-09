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
     

       // {
        //   $lookup: {
        //     from: collection.PRODUCTS_COLLECTION,
        //     let: { proList: '$products' },
        //     pipeline: [
        //       {
        //         $match: {
        //           $expr: {
        //             $in: ['$_id', "$$proList"]
        //           }
        //         }
        //       }
        //     ],
        //     as: 'cartItems'
        //   }
        // }




        ///Cart

        <div class="cart_section">
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg-10 offset-lg-1">
                <div class="cart_container">
                    <div class="cart_title">Shastri Cart <img src="/images/cartimg.jpg" style="height: 100px; width: 100px;" alt=""></div>

                    {{#if products}}
                    {{#each products}}

                    <div class="cart_items">
                        <ul class="cart_list">
                            <li class="cart_item clearfix">
                                <div class="cart_item_image"><img src="/images/product-images/{{this.item}}.jpg" alt=""></div>
                                <div class="cart_item_info d-flex flex-md-row flex-column justify-content-between">
                                    <div class="cart_item_name cart_info_col">
                                        <div class="cart_item_title">Name</div>
                                        {{#each this.product}}
                                        <div class="cart_item_text">{{this.name}} </div>
                                       
                                    </div>
                                 
                                    <div class="cart_item_price cart_info_col">
                                        <div class="cart_item_title">Description</div>
                                        <div class="cart_item_text"> {{this.description}} </div>
                                    </div>
                                    <div class="cart_item_total cart_info_col">
                                        <div class="cart_item_title">Price</div>
                                        <div class="cart_item_text">₹ {{this.price}} </div>
                                         {{/each}}
                                      
                                    </div>
                                          <div class="cart_item_quantity cart_info_col">
                                        <div class="cart_item_title">Quantity</div>
                                        <div class="cart_item_text">{{this.quantity}}</div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>

                {{/each}}
                {{/if}}


                    <div class="order_total">
                        <div class="order_total_content text-md-right">
                            <div class="order_total_title">Order Total:</div>
                            <div class="order_total_amount">₹22000</div>
                        </div>
                    </div>
                    <div class="cart_buttons"> <button type="button" class="button cart_button_clear">Continue
                            Shopping</button> <button type="button" class="button cart_button_checkout">GO TO 
                            HOME</button> </div>
                </div>
            </div>
        </div>
    </div>
</div>
<link rel="stylesheet" href="/stylesheets/cart.css">







{
  _id: new ObjectId("61fabef6fc40c290e681e39a"),
  user: new ObjectId("61f6db32dcc1037ab27a0b3f"),
  products: [
    { item: new ObjectId("61f29ef367d2ac3f1c5c9952"), quantity: 10 },
    { item: new ObjectId("61f2bc666c7f793d00646d03"), quantity: 3 },
    { item: new ObjectId("61fdd64fe5f25c882abbc1d6"), quantity: 1 },
    { item: new ObjectId("61f2c83941ec6dbf588c0c27"), quantity: 1 }
  ]
}