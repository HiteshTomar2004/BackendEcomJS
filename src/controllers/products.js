import { prisma } from '../config/db.js';

//This is for get
export const getAllProducts = async (req,res) =>{
    try{
      
      const { search } = req.query;
      let dbFilter={};
      
      //if there is a search param ?search= then check if there's a product with same name if not check if it has a same keyword
      if(search){
        dbFilter = {
          OR:[
            {name: {contains: search}},
            { keywords: {some: { word: {contains: search}}}}
          ]
        };
      }
      //dbfilter is empty and returned with all the products if search is false otherwise it only has filtered products
      const products = await prisma.product.findMany({
          where: dbFilter,
          include: {
              keywords: true
          }
      });

      //implicit return => ({ }) same as => {return{ }}
      const formatProducts = products.map((product) => {
        return{  
          id: product.id,
          image: product.image,
          name: product.name,
          rating: {
            stars: product.ratingStars,
            count: product.ratingCount
          },
          priceCents: product.priceCents,
          keywords: product.keywords.map((kw) => kw.word)
        }
      });

      res.status(200).json({success:true, data:formatProducts});
    }catch(error){
      res.status(500).json({success:false, error:error.message});
    }
};
//This is for post 
export const createProduct = async (req,res) => {
  try{
    const { image, name, rating, priceCents, keywords } = req.body;

    const newProduct = await prisma.product.create({
      data:{
        image,
        name,
        ratingStars: rating.stars,
        ratingCount: rating.count,
        priceCents,
        keywords: {
          connectOrCreate: keywords.map(word => ({
            where: { word : word },
            create: { word: word}
          }))
        }
      },
      include: { keywords:true }
    });

    res.status(201).json({success:true, data: newProduct});
  }
  catch(error){
    res.status(500).json({success:false, error: error.message});
  }
};