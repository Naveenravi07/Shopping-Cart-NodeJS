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