const Joi = require("joi");

const validationData = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().max(50).required().messages({
      "string.empty": "First name is required",
      "string.max": "First name must be at most 50 characters",
    }),
    lastName: Joi.string().allow("").optional(),

    emailId: Joi.string().email().required().messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email format",
    }),

    password: Joi.string().min(6).required().messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters long",
    }),

    age: Joi.number().min(18).optional().messages({
      "number.base": "Age must be a number",
      "number.min": "Age must be at least 18",
    }),

    gender: Joi.string().valid("male", "female", "other").optional().messages({
      "any.only": "Gender must be 'male', 'female' or 'other'",
    }),

    photoUrl: Joi.string().uri().optional().messages({
      "string.uri": "Photo URL must be a valid URI",
    }),

    about: Joi.string().optional(),

    skills: Joi.array().items(Joi.string()).optional().messages({
      "array.base": "Skills must be an array of strings",
    }),
  });

  return schema.validate(data, { abortEarly: false });
};

const validateProfileEditData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  return isEditAllowed;
};

const validatePassword = (newPassword) => {
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

	if (!passwordRegex.test(newPassword)) {
		throw new Error(
			"Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
		);
	}
};

module.exports = { validationData, validateProfileEditData , validatePassword};
