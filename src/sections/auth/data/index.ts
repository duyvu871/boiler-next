// Export schemas and types
export {
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  UpdateProfileSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type ChangePasswordInput,
  type UpdateProfileInput,
  validateEmail,
  validatePassword,
  validateName,
  getPasswordStrength,
} from './schemas';

// Export server actions
export {
  loginAction,
  registerAction,
  forgotPasswordAction,
  resetPasswordAction,
  changePasswordAction,
  verifyEmailAction,
} from './action';

// Export NextAuth redirect actions
export {
  redirectToLogin,
  redirectToDashboard,
  redirectToHome,
  redirectToGoogle,
} from './nextauth-actions';
