const express =require("express")
const router= express.Router();
const nodemailer = require("nodemailer");

router.post("/send-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "patil15rajput2000@gmail.com",
        pass: "imlw cojx xgod aujs",
      },
    });

    const mailOptions = {
      from: "patil15rajput2000@gmail.com",
      to: email,
      subject: "Your OTP for Payment Verification for InternArea Prime Plan",
      text: `Your OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully." });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send OTP." });
  }
});

module.exports=router