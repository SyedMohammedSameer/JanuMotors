export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };
  
  export const validateRequired = (value: string): boolean => {
    return value.trim().length > 0;
  };
  
  export const validateNumber = (value: number, min: number = 0): boolean => {
    return !isNaN(value) && value >= min;
  };
  
  export const validateYear = (year: number): boolean => {
    const currentYear = new Date().getFullYear();
    return year >= 1900 && year <= currentYear + 1;
  };