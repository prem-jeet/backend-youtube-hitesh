import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinaryUpload from "../utils/cloudinay.js";
import fs from "fs";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(500, "Access and refresh token generation failed.");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get use details in request
  const { fullname, email, username, password } = req.body;

  // validate the data received
  if (
    ["fullname", "email", "username", "password"].some((field) => field == "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // if user is unique - username, email
  const isExistingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (isExistingUser)
    throw new ApiError(409, "user with email or username already exist");

  // check for images, check for avatar
  const files = req.files;
  // console.log(files);
  if (!(files.avatar && files.avatar[0]))
    throw new ApiError(409, "Avatar is required");
  if (!(files.coverImage && files.coverImage[0]))
    throw new ApiError(409, "cover image is required");

  // if image availabe upload them to cloudinary and get url
  const avatarUrl = await cloudinaryUpload(files.avatar[0].path);
  const coverImageUrl = await cloudinaryUpload(files.coverImage[0].path);

  if (!(avatarUrl && coverImageUrl))
    throw new ApiError(409, "Avatar of cover image error..");

  fs.unlinkSync(files.avatar[0].path);
  fs.unlinkSync(files.coverImage[0].path);

  // create user object - create entry in db
  const user = await User.create({
    fullname,
    avatar: avatarUrl.url,
    coverImage: coverImageUrl.url,
    email,
    password,
    username: username.toLowerCase(),
  });
  // remove password and refresh token field from response
  // check for user creation
  const createdUser = await User.findById(user._id).select(
    "-password -refreshtoken"
  );
  if (!createdUser) throw new ApiError(500, "Failed to register user.");

  // return res
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req.body -> data
  const { username, password, email } = req.body;

  // username or email
  if (!(password && (email || username)))
    throw new ApiError(400, "Missing credendials.");
  // find user
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) throw new ApiError(404, "user not found.");
  // password check
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(400, "Incorrect password");

  // access and refresh token
  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // send cookie
  const loggedInUser = await User.findById(user._id).select(
    "-password -rerfreshToken"
  );

  /*By default any one can modify the cookies
  setting the below options to true, now only server can modify the cookie 
  */
  const cookieOptions = {
    httpOnly: true,
    secue: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User successfully logged in."
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  console.log({ user: req.user });
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: { refreshToken: "" },
      },
      {
        new: true,
      }
    ).select("-password -refreshToken");
    return res
      .status(200)
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json(
        new ApiResponse(
          200,
          {
            user: user,
          },
          "User successfully logged out"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Unable to log out user.");
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshtoken || req.body.refreshToken;

    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");

    const decodedIncomingToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedIncomingToken?._id);
    if (!user) throw new ApiError(401, "Unauthorized request");

    if (incomingRefreshToken !== user.refreshToken)
      throw new ApiError(401, "Refresh token expierd");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const cookieOptions = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeChangeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = User.findById(req.user?.id);
  if (!user) throw new ApiError(404, "user not forund");
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) throw new ApiError(400, "Invalid password");

  user.passWord = newPassword;
  await user.save({ validateBeforeSave: true });

  res
    .status(200)
    .send(new ApiResponse(200, {}, "Password updated successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(
    200,
    new ApiResponse(200, req.user, "current user fetched successfully")
  );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .send(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const files = req.files;

  if (!files.avatar || !files.avatar[0]) {
    throw new ApiError(409, "Avatar is required");
  }

  const path = files.avatar[0].path;

  const cloudinaryLink = await cloudinaryUpload(path);
  if (!cloudinaryLink || !cloudinaryLink.url) {
    fs.unlink(path);
    throw new ApiError(500, "Something went wrond while uploading avater");
  }

  const user = await User.findByIdAndUpdate(
    req.user.body,
    {
      $set: {
        avatar: cloudinaryLink.url,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .send(new ApiResponse(200, user, "Updated avatar succcessfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const files = req.files;

  if (!files.coverImage || !files.coverImage[0]) {
    throw new ApiError(409, "Cober image is required");
  }

  const path = files.coverImage[0].path;

  const cloudinaryLink = await cloudinaryUpload(path);
  if (!cloudinaryLink || !cloudinaryLink.url) {
    fs.unlink(path);
    throw new ApiError(500, "Something went wrond while uploading avater");
  }

  const user = await User.findByIdAndUpdate(
    req.user.body,
    {
      $set: {
        coverImage: cloudinaryLink.url,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .send(new ApiResponse(200, user, "Updated cover image succcessfully"));
});


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeChangeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserCoverImage,
  updateUserAvatar,
};
