const nodemailer = require("nodemailer");
const Token = require("../models/tokenModel");

const sendEmail = async (subject, message, send_to, sent_from, reply_to) =>{
    //create email transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        } 
    });
    //options for sending email 
    const  options = {
        from: sent_from,
        to: send_to,
        replyTo: reply_to || sent_from,
        subject: subject,
        html: message,
    }

//send email
// transporter.sendMail(options, function (err, info) {
//     if(err){
//         console.log(err)
//     }else{
//     console.log(info)
//     }
// });
// };
 try {
        const info = await transporter.sendMail(options);
        console.log("Email sent: ", info.response);
        return info;
    } catch (err) {
        console.error("Email sending failed:", err);
        throw err; // propagate error to be caught in your controller
    }
};
// console.log("Transport config:", {
//     host: process.env.EMAIL_HOST,
//     user: process.env.EMAIL_USER,
//     port: 587
// });

module.exports = sendEmail;