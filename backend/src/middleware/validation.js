const dns = require('dns').promises;
const { body, validationResult } = require('express-validator');

const validateEmailDomain = async (email) => {
  const parts = String(email).split('@');
  if (parts.length !== 2) {
    throw new Error('Email address must contain an @ symbol and a valid domain');
  }

  const domain = parts[1].toLowerCase();
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (mxRecords && mxRecords.length > 0) {
      return true;
    }
  } catch (err) {
    // fallback to A records if no MX records are found
  }

  try {
    const aRecords = await dns.resolve(domain);
    if (aRecords && aRecords.length > 0) {
      return true;
    }
  } catch (err) {
    throw new Error('Email domain does not appear to receive mail. Please check for typos or use a different address.');
  }
};

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  };
};

const reservationValidation = [
  body('date').isISO8601().withMessage('Please provide a valid date'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please provide valid time'),
  body('guests').isInt({ min: 1, max: 20 }).withMessage('Guests must be between 1 and 20'),
  body('specialRequests').optional().isLength({ max: 500 }).withMessage('Special requests too long')
];

const userValidation = [
  body('name').isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .bail()
    .custom(async (value) => validateEmailDomain(value)),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone')
    .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number')
    .bail()
    .custom((value) => {
      const invalidNumbers = ['0000000000', '1111111111', '1234567890', '9999999999'];
      if (invalidNumbers.includes(value)) {
        throw new Error('Please enter a real mobile number');
      }
      return true;
    })
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

module.exports = { validate, reservationValidation, userValidation, loginValidation };