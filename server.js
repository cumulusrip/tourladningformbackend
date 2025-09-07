const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support form submissions

// ✅ Root route with simple HTML form
app.get("/", (req, res) => {
  res.send(`
    <h2>Book A Tour (Test Form)</h2>
    <form method="POST" action="/send">
      <label>Your Name:</label><br/>
      <input type="text" name="name" required /><br/><br/>
      
      <label>Your Email:</label><br/>
      <input type="email" name="email" required /><br/><br/>
      
      <label>Phone Number:</label><br/>
      <input type="text" name="number" required /><br/><br/>
      
      <label>Destination:</label><br/>
      <input type="text" name="destination" required /><br/><br/>
      
      <label>Special Request:</label><br/>
      <textarea name="message"></textarea><br/><br/>
      
      <button type="submit">Book Now</button>
    </form>
  `);
});

// ✅ Email sending route
app.post("/send", async (req, res) => {
  const { name, email, number, destination, message } = req.body;
  console.log("📩 Incoming request:", req.body);

  try {
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  logger: true,
  debug: true,
});



    await transporter.verify()
      .then(() => console.log("✅ SMTP connection successful"))
      .catch(err => console.error("❌ SMTP connection failed:", err.message));

    let info = await transporter.sendMail({
      from: `"Tour Booking" <${process.env.SMTP_USER}>`,
      to: "urbaniasechalo@gmail.com", // change if you want dynamic
      subject: "New Tour Booking Request",
      html: `
        <h3>New Booking Request</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${number}</p>
        <p><b>Destination:</b> ${destination}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    console.log("✅ Email sent:", info.messageId);

    // If it's a browser form submission, show a success page
    if (req.headers["content-type"]?.includes("application/x-www-form-urlencoded")) {
      res.send("<h2>✅ Booking request sent successfully!</h2>");
    } else {
      res.status(200).json({ success: true, message: "Email sent successfully!" });
    }

  } catch (error) {
    console.error("❌ Email failed:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(5001, () => {
  console.log("🚀 Server started on http://localhost:5001");
});
