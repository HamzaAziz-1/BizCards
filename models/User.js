const mongoose = require("mongoose");
const { Schema } = mongoose;
const Joi = require("joi");
const bcrypt = require("bcryptjs");

const UserSchema = new Schema({
  name: {
    first: {
      type: String,
      required: true,
    },
    middle: {
      type: String,
    },
    last: {
      type: String,
      required: true,
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    state: {
      type: String,
    },
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    houseNumber: {
      type: String,
      required: true,
    },
  },
  isBusiness: {
    type: Boolean,
    default: false,
  },
  image: {
    url: {
      type: String,
      default:
        "https://res.cloudinary.com/dlpjcvsii/image/upload/v1688459756/file-upload/tmp-1-1688459755587_hvt1fy.png",
    },
    alt: {
      type: String,
    },
  },
},{timestamps:true});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

const userValidationSchema = Joi.object({
  name: Joi.object({
    first: Joi.string().required().messages({
      "any.required": "Please provide first name",
    }),
    middle: Joi.string().allow(null, ""),
    last: Joi.string().required().messages({
      "any.required": "Please provide last name",
    }),
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Please provide email",
  }),
  password: Joi.string().required().messages({
    "any.required": "Please provide password",
  }),
  role: Joi.string().valid("admin", "user").default("user"),
  phone: Joi.string().required().messages({
    "any.required": "Please provide phone number",
  }),
  address: Joi.object({
    state: Joi.string().allow(null, ""),
    country: Joi.string().required().messages({
      "any.required": "Please provide country",
    }),
    city: Joi.string().required().messages({
      "any.required": "Please provide city",
    }),
    street: Joi.string().required().messages({
      "any.required": "Please provide street",
    }),
    houseNumber: Joi.string().required().messages({
      "any.required": "Please provide houseNumber",
    }),
  }),
  isBusiness: Joi.boolean().default(false),
  image: Joi.object({
    url: Joi.string()
      .allow(null, "")
      .default(
        "https://res.cloudinary.com/dlpjcvsii/image/upload/v1688459756/file-upload/tmp-1-1688459755587_hvt1fy.png"
      ),
    alt: Joi.string().allow(null, ""),
  }),
});

const User = mongoose.model("User", UserSchema);

module.exports = { User, userValidationSchema };
