import {prisma} from '../config/db.js'
import { calculateOrderTotals } from '../utils/calculateTotals.js';

export const placeOrders = async(req, res) => {
    try{
        const {cartId} = req.body;

        //getting Order related details from cart
        const cart = await prisma.cart.findUnique({
            where: { id: cartId },
            include:{
                cartItems:{
                    include: {
                        product : true,
                        deliveryOption: true
                    }
                }
            }
        });

        if(!cart || cart.cartItems.length === 0){
            return res.status(404).json({success:false, message:"No items in cart"})
        }

        //Order Items array
        const totals = calculateOrderTotals(cart.cartItems);
        const orderItemsToCreate = [];

        for(const item of cart.cartItems){
           
            const deliveryDateMs = Date.now() + (item.deliveryOption.deliveryDays * 24*60*60*1000);

            orderItemsToCreate.push({
                productId: item.productId,
                quantity: item.quantity,
                estimatedDeliveryTime: new Date(deliveryDateMs) // conversion to native date 
            });
        }

        //Transaction / Order Creation
        const newOrder = await prisma.order.create({
            data:{
                totalCostCents: totals.totalCostCents,
                orderItem: {
                    create: orderItemsToCreate//adds an orderid to every cartitem prisma's nested writes
                }
            },
            include: {
                orderItem: {
                    include:{
                        product: true,
                    }
                }
            }
        });

        await prisma.cart.delete({
            where: { id: cartId }
        });

        res.status(201).json({
            success: true, message: "Order placed", data: newOrder 
        });

    }catch(error){
        res.status(500).json({success:false, error: error.message});
    }
}

export const getAllOrders = async (req, res) => {
    try{
        const orders = await prisma.order.findMany({
            orderBy: {//sort by newest descending
                createdAt : 'desc'
            },
            include: {
                orderItem:{
                    include:{
                        product:true
                    }
                }
            }
        });
        res.status(200).json({success:true, data: orders});
    }
    catch(error){
        res.status(500).json({success:false, error: error.message});
    }
}

export const getOrderById = async(req,res) =>{
    try{
        const {orderId} = req.params;

        const orderById = await prisma.order.findUnique({
            where: {id: orderId},
            include:{
                orderItem:{
                    include:{
                        product: true
                    }
                }
            }
        })
        if(!orderById){
            return res.status(404).json({success:false, message:"order not found"});
        }
        res.status(200).json({ success:true, data: orderById});
    }
    catch(error){
        res.status(500).json({success:false, error: error.message});
    }
}