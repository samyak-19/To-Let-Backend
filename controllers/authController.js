const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { asyncHandler } = require("../utils/asyncHandler");
// const { sendEmail } = require("../utils/nodeMailer");
const { sendToken } = require("../utils/sendToken");
const { ApiError } = require("../utils/ApiError");
const nodemailer = require("nodemailer");

// User SignUp
exports.userSignup = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    role,
    userType,
    answer,
  } = req.body;

  console.log("HEYYYYYY");

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(400, "A user with this email already exists."));
  }

  // Create new user
  const user = new User({
    firstName,
    lastName,
    email,
    password,
    phoneNumber: phone,
    role,
    userType,
    firstSchool: answer,
  });

  await user.save();

  // Generate account verification URL
  const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/verify/${user._id}`;

  const transporter = nodemailer.createTransport({
    host: "sg2plzcpnl508365.prod.sin2.secureserver.net",
    port: 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    secure: true,
  });

  // Set up email options for account verification
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: user.email,
    subject: "Verify Your Account",
    html: `

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #ecf0f1;
            margin: 0;
            padding: 0;
            color: #2c3e50;
        }

        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #2c3e50;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .content {
            background-color: #ecf0f1;
            padding: 20px;
            border-radius: 10px;
        }

        h1 {
            color: #2c3e50;
        }

        .button {
            display: inline-block;
            padding: 10px 20px;
            margin: 10px 0;
            background-color: #3498db;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }

        .button:hover {
            background-color: #2980b9;
        }

        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 0.9em;
            color: #bdc3c7;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="content">
            <h1>Hello, ${user.firstName}</h1>
            <p>Thank you for signing up. Please click the button below to verify your account:</p>
            <a href="${verificationLink}" class="button">Verify Account</a>
            <p>If the button above does not work, you can also verify your account by clicking the following link:</p>
            <p><a href="${verificationLink}">${verificationLink}</a></p>
            <p>Thank you,<br>To-Let Globe</p>
        </div>
        <div class="footer">
            <p>If you did not request this email, please ignore it.</p>
        </div>
    </div>
</body>

</html>
        `,
  };

  try {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(400).send("Something went wrong.");
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).send("Form submitted successfully!");
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Internal server error");
  }

  // try {
  //   await sendEmail(mailOptions);
  //   res.status(200).json({
  //     message:
  //       "Registration successful! Check your email for account verification.",
  //   });
  // } catch (error) {
  //   return next(
  //     new ApiError(
  //       500,
  //       "An error occurred while sending the verification email. Please try again later."
  //     )
  //   );
  // }
});

// Account Verification
exports.verifyAccount = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find the user by ID
  const user = await User.findById(id);
  if (!user) {
    return next(
      new ApiError(404, "Invalid verification link or user does not exist.")
    );
  }

  // Check if the account is already verified
  if (user.isVerified) {
    return res
      .status(200)
      .json({ message: "Your account is already verified." });
  }

  // Mark the account as verified
  user.isVerified = true;
  await user.save();
  res.status(200);
  html: `
  <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        .container {
            background-color: #2c3e50;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            width: 500px;
            max-width: 100%;
            padding: 20px;
            color: #ecf0f1;
        }

        .content {
            background-color: #34495e;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }

        .content p {
            font-size: 16px;
            margin-bottom: 20px;
        }

        .content a {
            display: inline-block;
            background-color: #3498db;
            color: #fff;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            font-size: 16px;
            margin-bottom: 20px;
        }

        .footer {
            text-align: center;
            margin-top: 20px;
        }

        .footer p {
            font-size: 14px;
            color: #bdc3c7;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="content">
            Your account is already verified.
        </div>
        <div class="footer">
            <p>Thank you for Registration , to Continue please Login.</p>
        </div>
    </div>
</body>

</html>
 `;
});

// User Signin
exports.userSignin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email and select password
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ApiError(400, "User not found."));
  }

  // Compare the password with the stored hash
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ApiError(401, "Invalid credentials."));
  }

  // Check if the user has verified their account
  if (!user.isVerified) {
    return next(new ApiError(403, "Please verify your account first."));
  }
  sendToken(user, 200, res);
});

// User Signout
exports.userSignout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Successfully signed out." });
});

// Forgot Password
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email, answer } = req.body;

  if (!email || !answer) {
    return next(
      new ApiError(400, "Please provide both email and firstSchool.")
    );
  }

  const user = await User.findOne({ email, firstSchool: answer });

  if (!user) {
    return next(new ApiError(404, "User not found or incorrect firstSchool."));
  }

  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save();

  const resetURL = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: user.email,
    subject: "Password Reset Request",
    html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      p {
      margin-top: 5px;
        font-size: 16px;
        color: #666666;
      }
      .button {
        display: inline-block;
        padding: 12px 20px;
        font-size: 16px;
        color: #ffffff;
        background-color: #007bff;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 20px;
        margin-bottom: 15px;
        text-align: center;
        cursor: pointer;
      }
      .footer {
        text-align: left;
        margin-top: 20px;
        font-size: 12px;
        color: #999999;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <p>Hello, ${user.firstName}</p>
      <p>
        You recently requested to reset your password. Click the button below to
        reset it:
      </p>
      <a href="${resetURL}" class="button">Reset Password</a>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>Thank you,</p>
      <p>To-Let Globe</p>
      <div class="footer">
        <p>If you did not request this email, please ignore it.</p>
      </div>
    </div>
  </body>
</html>
`,
  };

  try {
    await sendEmail(mailOptions);
    res
      .status(200)
      .json({ message: "Password reset link has been sent to your email." });
  } catch (error) {
    return next(
      new ApiError(
        500,
        "Failed to send password reset email. Please try again later."
      )
    );
  }
});

// Reset Password
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token, password } = req.body;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({
    _id: decoded.id,
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError(400, "Invalid or expired password reset token."));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res
    .status(200)
    .json({ message: "Your password has been reset successfully." });
});

exports.accountSecurity = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  console.log(currentPassword, newPassword);

  if (!currentPassword || !newPassword) {
    return next(
      new ApiError(
        400,
        "Please provide both current password and new password."
      )
    );
  }
  const user = await User.findById(req.userId).select("+password");
  if (!user) {
    return next(new ApiError(400, "User not found."));
  }
  // Compare the password with the stored hash
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new ApiError(401, "Please enter the correct old password."));
  }
  user.password = newPassword;
  await user.save();
  sendToken(user, 201, res);
});
