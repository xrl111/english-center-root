import * as yup from 'yup';

// Reusable error messages
export const errorMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  min: (field, length) => `${field} must be at least ${length} characters`,
  max: (field, length) => `${field} must not exceed ${length} characters`,
  number: 'Please enter a valid number',
  integer: 'Please enter a whole number',
  positive: 'Please enter a positive number',
  url: 'Please enter a valid URL',
  date: 'Please enter a valid date',
  password: {
    min: 'Password must be at least 8 characters',
    matches: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  },
  confirmPassword: 'Passwords must match',
  phone: 'Please enter a valid phone number',
};

// Common field schemas
export const commonFields = {
  email: yup
    .string()
    .email(errorMessages.email)
    .required(errorMessages.required),

  password: yup
    .string()
    .min(8, errorMessages.password.min)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      errorMessages.password.matches
    )
    .required(errorMessages.required),

  confirmPassword: (fieldName = 'password') =>
    yup
      .string()
      .oneOf([yup.ref(fieldName)], errorMessages.confirmPassword)
      .required(errorMessages.required),

  name: yup
    .string()
    .min(2, errorMessages.min('Name', 2))
    .max(50, errorMessages.max('Name', 50))
    .required(errorMessages.required),

  phone: yup
    .string()
    .matches(/^[0-9+\-() ]+$/, errorMessages.phone)
    .min(10, errorMessages.min('Phone number', 10))
    .max(15, errorMessages.max('Phone number', 15)),

  url: yup
    .string()
    .url(errorMessages.url),

  date: yup
    .date()
    .typeError(errorMessages.date)
    .required(errorMessages.required),
};

// Authentication schemas
export const loginSchema = yup.object({
  email: commonFields.email,
  password: yup.string().required(errorMessages.required),
  remember: yup.boolean(),
});

export const registerSchema = yup.object({
  username: commonFields.name,
  email: commonFields.email,
  password: commonFields.password,
  confirmPassword: commonFields.confirmPassword(),
});

// Profile schemas
export const profileSchema = yup.object({
  username: commonFields.name,
  email: commonFields.email,
  phone: commonFields.phone,
  bio: yup.string().max(500, errorMessages.max('Bio', 500)),
});

// Course schemas
export const courseSchema = yup.object({
  title: yup
    .string()
    .min(3, errorMessages.min('Title', 3))
    .max(100, errorMessages.max('Title', 100))
    .required(errorMessages.required),
  description: yup
    .string()
    .min(10, errorMessages.min('Description', 10))
    .max(2000, errorMessages.max('Description', 2000))
    .required(errorMessages.required),
  level: yup.string().required(errorMessages.required),
  duration: yup.string().required(errorMessages.required),
  startDate: commonFields.date,
  endDate: yup
    .date()
    .min(yup.ref('startDate'), 'End date must be after start date')
    .required(errorMessages.required),
  maxStudents: yup
    .number()
    .positive(errorMessages.positive)
    .integer(errorMessages.integer)
    .required(errorMessages.required),
  instructor: yup.string().required(errorMessages.required),
});

// Schedule schemas
export const scheduleSchema = yup.object({
  title: yup
    .string()
    .min(3, errorMessages.min('Title', 3))
    .max(100, errorMessages.max('Title', 100))
    .required(errorMessages.required),
  startTime: commonFields.date,
  endTime: yup
    .date()
    .min(yup.ref('startTime'), 'End time must be after start time')
    .required(errorMessages.required),
  location: yup.string().required(errorMessages.required),
  instructor: yup.string().required(errorMessages.required),
  maxAttendees: yup
    .number()
    .positive(errorMessages.positive)
    .integer(errorMessages.integer)
    .required(errorMessages.required),
});

// News schemas
export const newsSchema = yup.object({
  title: yup
    .string()
    .min(3, errorMessages.min('Title', 3))
    .max(200, errorMessages.max('Title', 200))
    .required(errorMessages.required),
  content: yup
    .string()
    .min(10, errorMessages.min('Content', 10))
    .required(errorMessages.required),
  category: yup.string().required(errorMessages.required),
  imageUrl: commonFields.url,
  publishDate: commonFields.date,
  tags: yup.array().of(yup.string()),
});

export default {
  errorMessages,
  commonFields,
  loginSchema,
  registerSchema,
  profileSchema,
  courseSchema,
  scheduleSchema,
  newsSchema,
};