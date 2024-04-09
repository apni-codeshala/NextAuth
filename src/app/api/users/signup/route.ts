import connect from "@/dbConfig/dbConfig";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendMail } from "@/helpers/mailer";

connect();

export async function POST(request: NextRequest) {
    try {

        const reqBody = request.json();
        const {username, email, password} = await reqBody;
        console.log(reqBody);

        // validation
        const user = await User.findOne({email});
        if(user) {
            return NextResponse.json({error: "User already exists"}, {status: 400});
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);
        // console.log(hashedPassword);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });
        // console.log("New User", newUser);

        const saveUser = await newUser.save();
        console.log("DB save user", saveUser);

        await sendMail({email, emailType: "VERIFY", userId: saveUser._id});

        return NextResponse.json({
            message: "User registered succssfully",
            succes: true,
            saveUser
        })


    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status: 500});
    }
}