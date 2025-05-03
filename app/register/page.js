'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Added validation state
  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    country: '',
  });
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    country: false,
  });
  const [validFields, setValidFields] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    country: false,
  });

  const { register, loading, error: apiError } = useAuth();

  // Validate fields when input changes
  useEffect(() => {
    if (touched.firstName) {
      const firstNameError = validateFirstName(firstName);
      setFormErrors(prev => ({...prev, firstName: firstNameError}));
      setValidFields(prev => ({...prev, firstName: !firstNameError && firstName.length > 0}));
    }

    if (touched.lastName) {
      const lastNameError = validateLastName(lastName);
      setFormErrors(prev => ({...prev, lastName: lastNameError}));
      setValidFields(prev => ({...prev, lastName: !lastNameError && lastName.length > 0}));
    }

    if (touched.email) {
      const emailError = validateEmail(email);
      setFormErrors(prev => ({...prev, email: emailError}));
      setValidFields(prev => ({...prev, email: !emailError && email.length > 0}));
    }

    if (touched.password) {
      const passwordError = validatePassword(password);
      setFormErrors(prev => ({...prev, password: passwordError}));
      setValidFields(prev => ({...prev, password: !passwordError && password.length > 0}));
    }

    if (touched.country) {
      const countryError = validateCountry(country);
      setFormErrors(prev => ({...prev, country: countryError}));
      setValidFields(prev => ({...prev, country: !countryError && country.length > 0}));
    }
  }, [firstName, lastName, email, password, country, touched]);

  // Update validation functions

  const validateFirstName = (name) => {
    // Don't show error if empty - we'll catch this on submit
    if (!name || name.trim().length === 0) return '';
    if (name.trim().length < 2) return 'First name must be at least 2 characters';
    return '';
  };

  const validateLastName = (name) => {
    // Don't show error if empty - we'll catch this on submit
    if (!name || name.trim().length === 0) return '';
    if (name.trim().length < 2) return 'Last name must be at least 2 characters';
    return '';
  };

  const validateEmail = (email) => {
    // Don't show error if empty - we'll catch this on submit
    if (!email || email.trim().length === 0) return '';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    // Don't show error if empty - we'll catch this on submit
    if (!password || password.length === 0) return '';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const validateCountry = (country) => {
    // Don't show error if empty - we'll catch this on submit
    if (!country || country.trim().length === 0) return '';
    if (country.trim().length < 2) return 'Country must be at least 2 characters';
    return '';
  };

  const handleBlur = (field) => {
    // Only set touched to true if the field has content or was previously touched
    if (
      (field === 'firstName' && firstName.length > 0) ||
      (field === 'lastName' && lastName.length > 0) ||
      (field === 'email' && email.length > 0) ||
      (field === 'password' && password.length > 0) ||
      (field === 'country' && country.length > 0) ||
      touched[field]
    ) {
      setTouched(prev => ({ ...prev, [field]: true }));

      if (field === 'firstName') {
        const firstNameError = validateFirstName(firstName);
        setFormErrors(prev => ({ ...prev, firstName: firstNameError }));
        setValidFields(prev => ({...prev, firstName: !firstNameError && firstName.length > 0}));
      } else if (field === 'lastName') {
        const lastNameError = validateLastName(lastName);
        setFormErrors(prev => ({ ...prev, lastName: lastNameError }));
        setValidFields(prev => ({...prev, lastName: !lastNameError && lastName.length > 0}));
      } else if (field === 'email') {
        const emailError = validateEmail(email);
        setFormErrors(prev => ({ ...prev, email: emailError }));
        setValidFields(prev => ({...prev, email: !emailError && email.length > 0}));
      } else if (field === 'password') {
        const passwordError = validatePassword(password);
        setFormErrors(prev => ({ ...prev, password: passwordError }));
        setValidFields(prev => ({...prev, password: !passwordError && password.length > 0}));
      } else if (field === 'country') {
        const countryError = validateCountry(country);
        setFormErrors(prev => ({ ...prev, country: countryError }));
        setValidFields(prev => ({...prev, country: !countryError && country.length > 0}));
      }
    }
  };

  // Function to determine input field border color class
  const getBorderColorClass = (field) => {
    if (!touched[field]) return 'border-[#333333]';
    if (formErrors[field]) return 'border-red-500 focus:ring-red-500';
    if (validFields[field]) return 'border-green-500 focus:ring-green-500';
    return 'border-[#333333] focus:ring-[#7749F8]';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    // Use the strict validation on submit
    const firstNameError = firstName ? validateFirstName(firstName) : 'First name is required';
    const lastNameError = lastName ? validateLastName(lastName) : 'Last name is required';
    const emailError = email ? validateEmail(email) : 'Email is required';
    const passwordError = password ? validatePassword(password) : 'Password is required';
    const countryError = country ? validateCountry(country) : 'Country is required';

    if (firstNameError || lastNameError || emailError || passwordError || countryError) {
      setFormErrors({
        firstName: firstNameError,
        lastName: lastNameError,
        email: emailError,
        password: passwordError,
        country: countryError
      });
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        password: true,
        country: true
      });
      return;
    }

    if (!agreedToTerms) {
      setFormError('You must agree to the Terms & Conditions.');
      return;
    }

    const fullName = `${firstName} ${lastName}`.trim();

    try {
      setSuccessMessage('');
      const success = await register(fullName, email, password, country);

      if (success) {
        setSuccessMessage('Account created successfully! Redirecting to dashboard...');
        // The redirection is handled in the AuthContext
      }
    } catch (err) {
      console.error('Registration error:', err);
      setFormError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#662d91]">
      <div className="flex flex-grow">
        {/* Left Column with Tokyo Tower background */}
        <div className="hidden md:block relative w-1/2 bg-cover bg-center"
             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1513407030348-c983a97b98d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80')" }}>

          {/* Purple overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#662d91]/50 to-[#662d91]/70"></div>

          <div className="flex flex-col h-full justify-between p-8 relative z-10">
            <div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 mr-2 text-white">
                  <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
                </svg>
                <h2 className="text-4xl font-bold text-white">TaskMaster</h2>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <h3 className="text-3xl font-bold text-white">
                Start Your Productivity Journey
              </h3>
              <p className="text-white/80 text-lg max-w-md">
                Join thousands of teams who use TaskMaster to organize, track, and achieve more together.
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white text-sm">Free 30-day trial, no credit card required</span>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white text-sm">Unlimited tasks and projects</span>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white text-sm">Advanced analytics and reporting</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-yellow-400">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white text-sm">"TaskMaster transformed how our team works!" - TechCrunch</span>
                  </div>
                  <div className="text-white/50 text-xs pl-7">Join over 10,000+ teams who trust TaskMaster</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center">
          <div className="w-full max-w-lg p-8 px-10">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Create an account</h1>
              <p className="text-gray-400 mb-6">
                Join TaskMaster and start managing your tasks efficiently
              </p>
              <div className="flex items-center space-x-2 mb-8">
                <span className="h-0.5 w-12 bg-[#7749F8]"></span>
                <span className="h-0.5 w-1.5 bg-[#7749F8]/50"></span>
                <span className="h-0.5 w-1.5 bg-[#7749F8]/50"></span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Success message notification */}
              {successMessage && (
                <div className="rounded bg-green-500/20 border border-green-500 p-4 text-sm text-green-200 flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {successMessage}
                </div>
              )}

              {/* Error message notification */}
              {(apiError || formError) && (
                <div className="rounded bg-red-500/20 border border-red-500 p-4 text-sm text-red-200 flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-red-400">
                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                  </svg>
                  {formError || apiError}
                </div>
              )}

              {/* First Name and Last Name fields side by side */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* First Name field */}
                <div className="w-full md:w-1/2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onBlur={() => handleBlur('firstName')}
                      className={`w-full bg-[#111] py-3 px-4 rounded-md border ${getBorderColorClass('firstName')} text-white focus:outline-none focus:ring-1`}
                      placeholder="Enter your first name"
                      required
                    />

                    {touched.firstName && (
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        {formErrors.firstName ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        ) : validFields.firstName && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                  {touched.firstName && formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>
                  )}
                </div>

                {/* Last Name field */}
                <div className="w-full md:w-1/2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onBlur={() => handleBlur('lastName')}
                      className={`w-full bg-[#111] py-3 px-4 rounded-md border ${getBorderColorClass('lastName')} text-white focus:outline-none focus:ring-1`}
                      placeholder="Enter your last name"
                      required
                    />

                    {touched.lastName && (
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        {formErrors.lastName ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        ) : validFields.lastName && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                  {touched.lastName && formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-500">
                      <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                      <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    required
                    aria-invalid={Boolean(formErrors.email)}
                    aria-describedby={formErrors.email ? "email-error" : undefined}
                    className={`w-full rounded-md bg-[#1b1b1b] p-3 pl-10 text-white placeholder-gray-500 outline-none focus:ring-2 border ${getBorderColorClass('email')}`}
                  />
                  {touched.email && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {formErrors.email ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : validFields.email ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : null}
                    </div>
                  )}
                </div>
                {touched.email && formErrors.email && (
                  <p className="mt-1 text-xs text-red-400" id="email-error">{formErrors.email}</p>
                )}
              </div>

              {/* Country field */}
              <div className="space-y-2">
                <label htmlFor="country" className="block text-sm font-medium text-gray-300">Country</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-500">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM6.262 6.072a8.25 8.25 0 1010.562-.766 4.5 4.5 0 01-1.318 1.357L14.25 7.5l.165.33a.809.809 0 01-1.086 1.085l-.604-.302a1.125 1.125 0 00-1.298.21l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 01-2.288 4.04l-.723.724a1.125 1.125 0 01-1.298.21l-.153-.076a1.125 1.125 0 01-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 01-.21-1.298L9.75 12l-1.64-1.64a6 6 0 01-1.676-3.257l-.172-1.03z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="country"
                    type="text"
                    placeholder="Your country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    onBlur={() => handleBlur('country')}
                    required
                    aria-invalid={Boolean(formErrors.country)}
                    aria-describedby={formErrors.country ? "country-error" : undefined}
                    className={`w-full rounded-md bg-[#1b1b1b] p-3 pl-10 text-white placeholder-gray-500 outline-none focus:ring-2 border ${getBorderColorClass('country')}`}
                  />
                  {touched.country && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {formErrors.country ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : validFields.country ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : null}
                    </div>
                  )}
                </div>
                {touched.country && formErrors.country && (
                  <p className="mt-1 text-xs text-red-400" id="country-error">{formErrors.country}</p>
                )}
              </div>

              {/* Password field with visibility toggle */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-500">
                      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    required
                    aria-invalid={Boolean(formErrors.password)}
                    aria-describedby={formErrors.password ? "password-error" : undefined}
                    className={`w-full rounded-md bg-[#1b1b1b] p-3 pl-10 text-white placeholder-gray-500 outline-none focus:ring-2 border pr-10 ${getBorderColorClass('password')}`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-300 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                        {showPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L6.228 6.228" />
                        ) : (
                          <>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                  {touched.password && (
                    <div className="absolute inset-y-0 right-10 flex items-center">
                      {formErrors.password ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : validFields.password && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                {touched.password && formErrors.password && (
                  <p className="mt-1 text-xs text-red-400" id="password-error">{formErrors.password}</p>
                )}
                {touched.password && validFields.password && (
                  <p className="mt-1 text-xs text-green-400">Password meets requirements</p>
                )}
                {!touched.password && (
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                )}
              </div>

              {/* Terms and conditions */}
              <div className="flex items-start mt-6">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-600 bg-[#1b1b1b] text-[#7749F8] focus:ring-0 focus:ring-offset-0"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-300">
                    I agree to the{' '}
                    <a href="#" className="text-[#7749F8] hover:text-[#6438e4] font-medium">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-[#7749F8] hover:text-[#6438e4] font-medium">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-md bg-[#7749F8] p-3.5 text-center font-medium text-white transition-all mt-6 ${
                  loading ? 'opacity-70' : 'hover:bg-[#6438e4] shadow-lg hover:shadow-[#7749F8]/20'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </div>
                ) : 'Create account'}
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Already have an account?{' '}
                  <Link href="/login" className="text-[#7749F8] font-medium hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}