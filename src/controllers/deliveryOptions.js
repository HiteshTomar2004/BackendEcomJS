import { prisma } from "../config/db.js"

export const getDeliveryOptions = async (req,res) =>{
    
    try{
        const deliveryOptions = await prisma.deliveryOption.findMany();
        res.status(200).json({success:true, data: deliveryOptions});

    }catch(error){
        res.status(500).json({success:false, error: error.message});
    }
};