// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation - Requisitos del backend:
// - Mínimo 8 caracteres
// - Al menos 1 mayúscula
// - Al menos 1 minúscula  
// - Al menos 1 número
const passwordMinLength = 8;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Name validation (2-100 characters)
const nombreValidation = {
  minLength: 2,
  maxLength: 100
};

// Field validation function
export const validateField = (field, value) => {
  switch (field) {
    case 'email':
      return emailRegex.test(value) ? null : 'Email inválido';
    case 'password':
      if (value.length < passwordMinLength) {
        return 'Mínimo 8 caracteres';
      }
      if (!passwordRegex.test(value)) {
        return 'Debe contener al menos: 1 mayúscula, 1 minúscula, 1 número';
      }
      return null;
    case 'nombre':
      return value.length >= nombreValidation.minLength && value.length <= nombreValidation.maxLength
        ? null : 'Entre 2 y 100 caracteres';
    default:
      return null;
  }
};

// Validate entire form
export const validateForm = (formData) => {
  const errors = {};
  
  Object.keys(formData).forEach(field => {
    const error = validateField(field, formData[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Función auxiliar para mostrar los requisitos de contraseña
export const getPasswordRequirements = () => {
  return [
    'Mínimo 8 caracteres',
    'Al menos 1 letra mayúscula (A-Z)',
    'Al menos 1 letra minúscula (a-z)',
    'Al menos 1 número (0-9)'
  ];
};

// Función para generar una contraseña de ejemplo válida
export const getValidPasswordExample = () => {
  return 'MiPass123';
};