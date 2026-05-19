import { prisma } from '../config/db.js'
import { calculateOrderTotals } from '../utils/calculateTotals.js';

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
        if(cart.userId && (!req.user || req.user.id !== cart.userId)){
            return res.status(403).json({success: false, message: "Unauthorized to view this cart"});
        }

        res.status(200).json({success:true, data: cart});

    }catch(error){
        res.status(500).json({success:false, error: error.message});
    }
}

export const addToCart = async(req,res) => {
    try{
        let {cartId, productId, quantity, deliveryOptionId} = req.body;

        if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
            return res.status(400).json({ 
                success: false, 
                message: "Nice try. Quantity must be at least 1." 
            });
        }

        if(!cartId){
            if(req.user) {
                const existingUserCart = await prisma.cart.findFirst({where: {userId: req.user.id}});
                
                if(existingUserCart) {
                    cartId = existingUserCart.id;
                }else{
                    const newCart = await prisma.cart.create({ data: { userId: req.user.id} });
                    cartId = newCart.id;
                }
            }else{
                const newCart = await prisma.cart.create({ data: {} });
                cartId = newCart.id;
            }
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

        const updatedItem = await prisma.cartItem.update({
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

export const paymentSummaryDetails = async(req,res)=>{
    try{
        const {cartId} = req.params;

        //extract cart details
        const cart = await prisma.cart.findUnique({
            where: {id: cartId},
            include:{
                cartItems:{
                    include:{
                        product: true,
                        deliveryOption: true
                    }
                }
            }
        });

        if(!cart || cart.cartItems.length === 0){
            return res.status(404).json({success:false, message:"cart is empty"});
        }

        if (cart.userId && (!req.user || req.user.id !== cart.userId)) {
            return res.status(403).json({ success: false, message: "Unauthorized acesss to view cart"});
        }

        const totals = calculateOrderTotals(cart.cartItems);

        res.status(200).json({
            success:true,
            data: totals
        });
    }catch(error){
        res.status(500).json({success:false, error: error.message});
    };
};