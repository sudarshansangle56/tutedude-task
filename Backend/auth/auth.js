const express = require("express");
const usermodel = require("../models/userModel");
const bcrypt = require("bcryptjs"); 

const router = express.Router();

router.post("/create", async (req, res) => {
  const { name, email, password, age, url } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const createdUser = await usermodel.create({ 
      name, 
      email, 
      password: hashedPassword, 
      age, 
      url 
    });

    res.redirect("/read");
  } catch (err) {
    res.status(500).send("Error registering user");
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await usermodel.findOne({ email });

    if (!user) {
      return res.status(400).send("User not found");
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (validPassword) {
        res.send("Login sucessfull");
    } else {
      res.status(400).send("Invalid email or password");
    }
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;