/**
 * Validaciones relacionadas con usuarios
 */

export const validateEmail = (email: string): boolean => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

export const validatePassword = (password: string): boolean => {
  return (
    password.length >= 5 && /[A-Z]/.test(password) && /[a-z]/.test(password)
  );
};

export const validateName = (name: string): boolean => {
  return /^[A-Za-z\s]+$/.test(name);
};

export const validateUserData = (userData: {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!validateEmail(userData.email)) {
    errors.email = "El email debe tener un formato válido";
  }

  if (!validatePassword(userData.password)) {
    errors.password =
      "La contraseña debe tener al menos 5 caracteres, una mayúscula y una minúscula";
  }

  if (userData.password !== userData.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }

  if (!validateName(userData.firstName)) {
    errors.firstName = "El nombre solo puede contener letras";
  }

  if (!validateName(userData.lastName)) {
    errors.lastName = "El apellido solo puede contener letras";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
