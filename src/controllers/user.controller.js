import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinaryUpload from "../utils/cloudinay.js";
import fs from "fs";

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

export default registerUser;
