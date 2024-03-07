const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

const URL = process.env.URL;
const PORT = process.env.PORT || 3001;

mongoose.connect(URL, { dbName: "CodeRed" });

const db = mongoose.connection;

db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

db.once("open", () => {
  console.log("Connected to MongoDB");
});

const User = mongoose.model("User", {
  name: String,
  email: String,
  phone: String,
  hobbies: String,
});

app.post("/sendmail", async (req, res) => {
  try {
    if (req.body.length === 0) {
      return res.status(400).json({ error: "No user selected" });
    }
    const users = await User.find({ _id: { $in: req.body } });

    const tableHtml = `
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Email</th>
            <th>Hobbies</th>
          </tr>
        </thead>
        <tbody>
          ${users
            .map(
              (user) => `
            <tr>
              <td>${user._id}</td>
              <td>${user.name}</td>
              <td>${user.phone}</td>
              <td>${user.email}</td>
              <td>${user.hobbies}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: "amankumartiwari392@gmail.com",
      subject: "This is Aman Tiwari",
      html: `
      <p>Hello there,</p>
      <p>This email contains a table with user data:</p>
      ${tableHtml}
    `,
    };

    await transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Email verification error:", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        console.log("Email sent ");
        res.status(200).json({ message: "Email sent" });
      }
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/adduser", async (req, res) => {
  try {
    const { name, email, phone, hobbies } = req.body;
    const user = await User.create({ name, email, phone, hobbies });
    res.send(user).status(200);
  } catch (err) {
    console.log(err);
  }
});

app.get("/getusers", async (req, res) => {
  try {
    const users = await User.find({});
    console.log(users);
    res.send(users).status(200);
  } catch (err) {
    console.log(err);
  }
});

app.delete("/deleteuser", async (req, res) => {
  try {
    const { id } = req.body;
    console.log(">>>>>>>>>>>>>", id);
    const user = await User.findByIdAndDelete(id);

    res.send(user).status(200);
  } catch (err) {
    console.log(err);
  }
});

app.put("/updateuser", async (req, res) => {
  try {
    const { id, name, email, phone, hobbies } = req.body;
    const user = await User.findByIdAndUpdate(id, {
      name,
      email,
      phone,
      hobbies,
    });
    res.send(user).status(200);
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
