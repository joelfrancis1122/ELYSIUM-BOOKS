const placeOrder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        // Find the user's cart
        const cart = await Cart.findOne({ userId }).populate('products.productId');
        // Check if the cart is empty
        if (!cart || !cart.products.length) {
            return res.status(400).send('Cart is empty');
        }
        // Get the selected address ID from the request body
        const selectedAddressId = req.body.selectedAddress;
        // Find the selected address
        const address = await Address.findOne({ _id: selectedAddressId, userId });
        // Ensure that the selected address exists and belongs to the user
        if (!address) {
            return res.status(400).send('Invalid address selected');
        }
        // Calculate total amount and set price for each item
        let totalAmount = 0;
        for (const item of cart.products) {
            // Calculate price for each item based on quantity and selling price
            const itemPrice = item.quantity * item.productId.selling_price;
            item.price = itemPrice;
            totalAmount += itemPrice;
        }
        // Ensure that paymentMethod is provided in the request body
        const paymentMethod = req.body.paymentMethod;
        if (!paymentMethod) {
            return res.status(400).send('Payment method is required');
        }
         // If payment method is 'Cash on Delivery' or 'Wallet'
        // Create the order with required fields
        const order = new Order({
            userId,
            items: cart.products,
            status: 'unpaid',
            totalAmount,
            paymentMethod,
            address: address._id
        });
        // If payment method is 'Online payment'
        if (paymentMethod == 'Online payment') {
           console.log("11111111")
           const options = {
               amount: 5000 * 100,
               currency: "INR",
               receipt: "fewhfbefefy23hg",
            };
            console.log("22222222222",options)
            const razorpayInstance = new Razorpay({
                key_id: "rzp_test_nrsjMCLp4uBA73",
                key_secret: "85vLhkkZcyCpIGKOzJFiq9mI",
            });
            console.log("3333333",razorpayInstance)
          razorpayInstance.orders.create(options,(err, order) => {
              if (err) {
                console.log(err);
                return res.json({ success: false });
              } else {
               return  res.json({
                  order: order,
                  success: true,
                  order_id: order.id,
                  key_id: "rzp_test_nrsjMCLp4uBA73",
                  paymentMethod: paymentMethod,
                 
                });
              }
            });
        }
        // Save the order to the database
        await order.save();
        // Clear the cart after placing the order
        await Cart.findOneAndUpdate({ userId }, { $set: { products: [] } });
        // Redirect to success page
        return res.redirect('/ordersuccess');
    } catch (error) {
        console.error(error);
    //    res.status(500).send('Internal Server Error');
    }
};


const onlinePay = async (req, res) => {
    try {
      const { amount, address } = req.body;
      console.log(amount)
      const userId = req.session.user
      const cart = await Cart.findOne({ userId: userId });
  
      // const address = await Address.findOne({ _id: req.body.address });
  
      function generateOrderId() {
          const timestamp = Date.now().toString();
          const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          let orderId = 'ORD';
          while (orderId.length < 6) {
              const randomIndex = Math.floor(Math.random() * randomChars.length);
              orderId += randomChars.charAt(randomIndex);
          }
          return orderId + timestamp.slice(-6);
      }
  
      const newOrderId = generateOrderId();
  
      const order = new Orders({
          orderId: newOrderId,
          userId: userId,
          paymentMethod: req.body.paymentMethod,
          totalAmount: req.body.amount,
          product: cart.product,
          address: address
      });
  
          await order.save()
  
      
      
      let amounts = amount*84
      const order2 = await instance.orders.create({
          amount: 500*100,
          currency: "INR",
          receipt: req.session.user,
          })
          
          res.json({order2})
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };