import { prisma } from '../config/db.js'

export const getCart = async(req,res) => {
    try{
        const { cartId } = req.params;

        const cart = await prisma.cart.findUnique({
            where:  {
                id: cartId
            },
            include: {
                cartItems : {
                    include : {
                        product: true,
                        deliveryOption: true
                    }
                }
            }
        });
        if(!cart){
            return res.status(404).json({success:true, message:"Cart not found"});
        }

        res.status(200).json({success:true, data: cart});

    }catch(error){
        res.status(500).json({success:false, error: error.message});
    }
}

export const addToCart = async(req,res) => {
    try{
        let {cartId, productId, quantity, deliveryOptionId} = req.body;

        if(!cartId){
            const newCart = await prisma.cart.create({ data: {} });
            cartId = newCart.id;
        }
        const cartItem = await prisma.cartItem.upsert({
            where:{
                cartId_productId: {//prima's syntax for looking up two connected fields
                    cartId: cartId,
                    productId: productId
                }
            },
            update:{
                quantity: { increment: quantity },
                deliveryOptionId: deliveryOptionId
            },
            create: {
                cartId: cartId,
                productId: productId,
                quantity: quantity,
                deliveryOptionId: deliveryOptionId
            }
        });
        res.status(200).json({
            success:true,
            message: "item added",
            cartId: cartId,
            data: cartItem
        });
    }catch(error){
        res.status(500).json({success:false, error: error.message});
    }
};

export const deleteFromCart = async(req,res) => {
    try{
        const {cartId, productId} = req.params;

        await prisma.cartItem.delete({
            where:{
                cartId_productId:{
                    cartId: cartId,
                    productId: productId
                }
            }
        });
        res.status(200).json({success:true, message: "Removed from cart"});
    }
    catch(error){
        if(error.code === 'P2025'){
            return res.status(404).json({success: false, message:"Item not found in cart"});
        }
        res.status(500).json({success: false, error: error.message});
    }
}

export const updateCart = async(req,res)=>{
    try{
        const {cartId, productId} = req.params;

        const {quantity} = req.body;

        if(quantity <= 0){
            await prisma.cartItem.delete({
                where:{
                    cartId_productId:{
                        cartId: cartId,
                        productId: productId
                    }
                }
            });
            return res.status(200).json({success: true, message:"removed item from cart"});
        }

        const updatedItem = prisma.cartItem.update({
            where: {
                cartId_productId:{
                    cartId: cartId,
                    productId: productId
                }
            },
            data: {
                quantity: quantity
            }
        });
        res.status(200).json({success:true, message: "quantity updated", data: updatedItem});
    
    }catch(error){
        if(error.code === 'P2025'){
            return res.status(500).json({success:false, message:"error Item not found"});
        }
        res.status(500).json({success:false, error: error.message});
    }
};