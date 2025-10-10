// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation (8+ characters)
const passwordMinLength = 8;

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
      return value.length >= passwordMinLength ? null : 'Mínimo 8 caracteres';
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