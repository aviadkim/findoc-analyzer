import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for form handling with validation
 * @param {Object} initialValues - Initial form values
 * @param {Function} validate - Validation function
 * @param {Function} onSubmit - Submit handler function
 * @returns {Object} Form handling utilities
 */
const useForm = (initialValues = {}, validate = () => ({ isValid: true, errors: {} }), onSubmit = () => {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Validate form when values change
  useEffect(() => {
    if (isDirty) {
      const validation = validate(values);
      setIsValid(validation.isValid);
      setErrors(validation.errors || {});
    }
  }, [values, validate, isDirty]);

  // Handle field change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    setValues(prevValues => ({
      ...prevValues,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    setIsDirty(true);
    
    // Mark field as touched
    if (!touched[name]) {
      setTouched(prevTouched => ({
        ...prevTouched,
        [name]: true
      }));
    }
  }, [touched]);

  // Handle field blur
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));
  }, []);

  // Set a specific field value
  const setFieldValue = useCallback((name, value) => {
    setValues(prevValues => ({
      ...prevValues,
      [name]: value
    }));
    
    setIsDirty(true);
  }, []);

  // Set multiple field values
  const setFieldValues = useCallback((newValues) => {
    setValues(prevValues => ({
      ...prevValues,
      ...newValues
    }));
    
    setIsDirty(true);
  }, []);

  // Set a specific field error
  const setFieldError = useCallback((name, error) => {
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: error
    }));
  }, []);

  // Set a field as touched
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: isTouched
    }));
  }, []);

  // Reset the form
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialValues]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    if (e) {
      e.preventDefault();
    }
    
    setIsDirty(true);
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    
    setTouched(allTouched);
    
    // Validate form
    const validation = validate(values);
    setIsValid(validation.isValid);
    setErrors(validation.errors || {});
    
    if (validation.isValid) {
      setIsSubmitting(true);
      
      // Call onSubmit handler
      Promise.resolve(onSubmit(values))
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  }, [values, validate, onSubmit]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldValues,
    setFieldError,
    setFieldTouched,
    resetForm,
  };
};

export default useForm;
