import User from '@/models/user.model';
import nodemailer from 'nodemailer';
import bcryptjs from "bcryptjs";

export const sendMail = async({email, emailType, userId}:any) => {
    try {

        const hashedToken = await bcryptjs.hash(userId.toString(), 10);

        if(emailType === "VERIFY") {
            await User.findByIdAndUpdate(
                userId, {
                    $set: {
                        verifyToken: hashedToken, 
                        verifyTokenExpiry: Date.now() + 3600000
                    }
                }
            );
        } else if (emailType === "RESET") {
            await User.findByIdAndUpdate(
                userId, {
                    $set: {
                        forgotPasswordToken: hashedToken, 
                        forgotPasswordTokenExpiry: Date.now() + 3600000
                    }
                }
            );
        }

        const transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "221d7b91a67bd3",
              pass: "a0e666ecd6ec61"
            }
        });

        const mailOption = {
            from: '"NextAuth 👻" <abhishekpatel171019@gmail.com>',
            to: email,
            subject: emailType === 'VERIFY' ? "Verify your email" : "Reset your password",
            html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ?  "verify your email" : "reset your passwprd"} or copy and paste the link below in your browser. <br>${process.env.DOMAIN}/verifyemail?token=${hashedToken}</p>`,
        }

        const response = await transporter.sendMail(mailOption);
        return response;
        
    } catch (error:any) {
        throw new Error(error.message);
    }
}