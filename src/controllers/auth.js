import { prisma } from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (res, id, version) =>{
    const token = jwt.sign({ id, version}, process.env.JWT_SECRET , { expiresIn: '30d'});
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30*24*60*60*1000
    });
};

const attachGuestCartToUser = async (guestCartId, userId) => {
    if(!guestCartId) return;
    const guestCart = await prisma.cart.findUnique({ where: { id: guestCartId } });
    if(guestCart && !guestCart.userId) {
        await prisma.cart.update({
            where: {id:guestCartId},
            data: {userId: userId}
        });
    }
};

export const registerUser = async (req, res) => {
    try{
        const {email, password, name, guestCartId} = req.body;
        const userExists = await prisma.user.findUnique({ where: { email }});
        if (userExists) return res.status(400).json({ success: false, message:"User already exists"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {email, password: hashedPassword, name}
        });

        await attachGuestCartToUser(guestCartId, user.id);
        generateTokenAndSetCookie(res, user.id, user.tokenVersion);

        res.status(200).json({success: true, data: {id: user.id, name: user.name, email: user.email} });
    }
    catch(error){
        res.status(500).json({ success: false, error: error.message});
    }
};

export const loginUser = async (req, res) => {
    try{
        const { email, password, guestCartId } = req.body;
        const user = await prisma.user.findUnique({ where: {email} });

        if(user && (await bcrypt.compare(password, user.password))) {
            await attachGuestCartToUser(guestCartId, user.id);
            generateTokenAndSetCookie(res, user.id, user.tokenVersion);

            res.status(200).json({success: true, data: {id: user.id, name: user.name, email: user.email} });
        }
        else{
            res.status(401).json({success:false, message: "Invalid email or password"});
        }
    }catch(error){
        res.status(500).json({ success: false, error:error.message });
    }

};

export const logoutUser = async(req, res)=>{
    res.cookie('jwt','', {htppOnly: true, expiresIn: new Date(0) });
    res.status(200).json({success:true, message: "logged out of this device"});
};

export const logoutAllDevices = async(req,res)=> {
    await prisma.user.update({
        where: { id: req.user.id},
        data: { tokenVersion: {increment: 1} }
    });
    res.cookie('jwt', '', {httpOnly:true, expires: new Date(0)});
    res.status(200).json({success: true, message: "logged out everywhere"});
};

