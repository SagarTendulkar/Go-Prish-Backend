// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",  // ✅ explicit host instead of service:"gmail"
//     port: 465,               // ✅ explicit port
//     secure: true,            // ✅ use SSL
//     family: 4,               // ✅ force IPv4
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

// const sendEmail = async ({ to, subject, html }) => {
//     await transporter.sendMail({
//         from: `"Tee Trends" <${process.env.EMAIL_USER}>`,
//         to,
//         subject,
//         html,
//     });
// };

// module.exports = sendEmail;

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
    await resend.emails.send({
        from: "Tee Trends <onboarding@resend.dev>", // use this until domain verified
        to,
        subject,
        html,
    });
};

module.exports = sendEmail;