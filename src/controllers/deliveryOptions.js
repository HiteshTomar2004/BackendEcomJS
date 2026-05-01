import { prisma } from "../config/db.js"

export const getDeliveryOptions = async (req,res) =>{
    
    try{
        const {expand} = req.query;
        const deliveryOptions = await prisma.deliveryOption.findMany();

        let responseData = deliveryOptions;

        if(expand === 'estimatedDeliveryTime'){
            responseData = deliveryOptions.map(option => {
                return {
                    ...option,
                    estimatedDeliveryTimeMs: Date.now() + (option.deliveryDays * 24 * 60 * 60 * 1000)
                }
            })
        }

        res.status(200).json({success:true, data: responseData});

    }catch(error){
        res.status(500).json({success:false, error: error.message});
    }
};