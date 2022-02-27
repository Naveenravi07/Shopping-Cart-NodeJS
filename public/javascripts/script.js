

function addToCart(proId) {
    $.ajax({

        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {

            if (response.status) {
                let count = $("#cartCount").html()
                count = parseInt(count) + 1
                $("#cartCount").html(count)
            }

        }
    })
}


function changeQuantity(cartId, proId, userId, count) {
    console.log(proId)
    let spanId = proId
    console.log(spanId)
    let quantity = document.getElementById(spanId).innerHTML
    quantity = parseInt(quantity)
    let newcount = parseInt(count);
    $.ajax({
        url: '/change-product-quantity',
        data: {
            cart: cartId,
            product: proId,
            count: newcount,
            quantity: quantity,
            user: userId,
        },
        method: 'post',
        success: (response) => {
            if (response.removeProduct) {
                location.reload()
            } else {
                document.getElementById(spanId).innerHTML = quantity + newcount
                console.log(response);
                document.getElementById("carttotalamount").innerHTML = response.total
                document.getElementById("hfgf").innerHTML = response.total
            }
        }
    })
}

function removeProduct(cartId, proId) {

    $.ajax({
        url: '/remove-product-fromcart',
        data: {
            cart: cartId,
            product: proId,
        },
        method: 'post',
        success: (response) => {
            if (response) {
                location.reload()
            }
        }
    })
}
