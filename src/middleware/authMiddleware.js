import jwt from 'jsonwebtoken';
import {prisma} from '../config/db.js'

export const protect = async (req,res,next) => {
    if(process.env.REQUIRE_AUTH == 'false') {
        return next();
    }

    const token = req.cookies.jwt;
    if(!token) return res.status(401).json({success: false, message: "Not authorized, no token"});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await prisma.user.findUnique({ where: {id: decoded.id}});

        if(!currentUser || decoded.version !== currentUser.tokenVersion) {
            return res.status(401).json({success:false, message: "Session Expired. Please log in again"})
        }

        req.user = {id: currentUser.id};
        next();
    }
    catch{
        return res.status(401).json({ success: false, message: "Not authorized"});
    }
}

export const optionalAuth = async (req, res, next)=> {
    const token = req.cookies.jwt;
    if(!token){
        return next();
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await prisma.user.findUnique({ where: { id: decoded.id }});
        
        if(currentUser && decoded.version === currentUser.tokenVersion) {
            req.user = {id: currentUser.id};
        }
        next();
    }catch{
        next();
    }
}
