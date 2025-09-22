export function validateCredentials(
    email: string,
    password: string,
    repeatPassword?: string
  ) {
    const forbiddenPattern = /[<>{};]/;
  
    if (!email || !password) {
      return "Email and password are required";
    }
    if (email.length > 50 || password.length > 50) {
      return "Email and password must be 50 characters or less";
    }
    if (forbiddenPattern.test(email) || forbiddenPattern.test(password)) {
      return "Email or password contains invalid characters";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (repeatPassword !== undefined && password !== repeatPassword) {
      return "Passwords do not match";
    }
  
    return null; // no errors
  }
  