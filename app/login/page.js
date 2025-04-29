'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  const [validFields, setValidFields] = useState({
    email: false,
    password: false
  });
  
  const { login, loading, error } = useAuth();

  // When the API error changes, update formErrors
  useEffect(() => {
    if (error) {
      let errorMessage = error;
      
      // Map technical error messages to user-friendly ones
      if (error.includes('Failed to fetch') || error.includes('Network Error')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.includes('404')) {
        errorMessage = 'Login service is currently unavailable. Please try again later.';
      }
      
      setFormErrors(prev => ({
        ...prev,
        general: errorMessage
      }));
    }
  }, [error]);

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (field === 'email') {
      const emailError = validateEmail(email);
      setFormErrors(prev => ({ ...prev, email: emailError }));
      setValidFields(prev => ({...prev, email: !emailError && email.length > 0}));
    } else if (field === 'password') {
      const passwordError = validatePassword(password);
      setFormErrors(prev => ({ ...prev, password: passwordError }));
      setValidFields(prev => ({...prev, password: !passwordError && password.length > 0}));
    }
  };

  const validateForm = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setFormErrors({
      email: emailError,
      password: passwordError,
      general: ''
    });
    
    setTouched({email: true, password: true});
    setValidFields({
      email: !emailError && email.length > 0,
      password: !passwordError && password.length > 0
    });
    
    return !emailError && !passwordError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // First validate the form fields
    if (!validateForm()) {
      return;
    }
    
    // Clear any previous errors before attempting login
    setFormErrors(prev => ({ ...prev, general: '' }));
    
    // Attempt login
    const success = await login(email, password);
    
    // Additional feedback can be added here if needed
    if (!success) {
      // Set a fallback error message if the login hook doesn't set one
      if (!error) {
        setFormErrors(prev => ({ 
          ...prev, 
          general: 'Login failed. Please check your credentials and try again.' 
        }));
      }
      // Focus on password field for re-entry when login fails
      document.getElementById('password').focus();
    }
  };

  // Function to determine input field border color class
  const getBorderColorClass = (field) => {
    if (!touched[field]) return 'border-[#333333]';
    if (formErrors[field]) return 'border-red-500 focus:ring-red-500';
    if (validFields[field]) return 'border-green-500 focus:ring-green-500';
    return 'border-[#333333] focus:ring-[#7749F8]';
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
                Welcome Back!
              </h3>
              <p className="text-white/80 text-lg max-w-md">
                Log in to unlock your productivity potential and manage your tasks with ease.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white text-sm">Smart task prioritization</span>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white text-sm">Team collaboration tools</span>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white text-sm">Progress tracking & insights</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    <img className="w-8 h-8 rounded-full border-2 border-purple-900" src="https://randomuser.me/api/portraits/women/12.jpg" alt="User"/>
                    <img className="w-8 h-8 rounded-full border-2 border-purple-900" src="https://randomuser.me/api/portraits/men/14.jpg" alt="User"/>
                    <img className="w-8 h-8 rounded-full border-2 border-purple-900" src="https://randomuser.me/api/portraits/women/19.jpg" alt="User"/>
                  </div>
                  <span className="text-sm text-white/70">Join 10,000+ users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Form */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center">
          <div className="w-full max-w-lg p-8 px-10">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
              <p className="text-gray-400 mb-6">
                Enter your credentials to access your account
              </p>
              <div className="flex items-center space-x-2 mb-8">
                <span className="h-0.5 w-12 bg-[#7749F8]"></span>
                <span className="h-0.5 w-1.5 bg-[#7749F8]/50"></span>
                <span className="h-0.5 w-1.5 bg-[#7749F8]/50"></span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {formErrors.general && (
                <div className="rounded bg-red-500/20 border border-red-500 p-4 text-sm text-red-200 flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-red-400">
                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                  </svg>
                  <div>
                    {formErrors.general}
                    {formErrors.general.includes('Invalid email or password') && (
                      <div className="mt-1 text-xs text-red-300">
                        Make sure you've entered the correct email and password combination.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <div className="relative">
                  <input 
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`w-full bg-[#111] py-3 px-4 rounded-md border ${getBorderColorClass('email')} text-white focus:outline-none focus:ring-1`}
                    placeholder="Enter your email"
                    required
                  />
                  
                  {touched.email && (
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      {formErrors.email ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      ) : validFields.email && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                {touched.email && formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className={`w-full bg-[#111] py-3 px-4 pr-10 rounded-md border ${getBorderColorClass('password')} text-white focus:outline-none focus:ring-1`}
                    placeholder="Enter your password"
                    required
                  />
                  
                  {/* Eye icon for password visibility */}
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Add the green checkmark when password is valid */}
                  {validFields.password && (
                    <div className="absolute inset-y-0 right-12 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {touched.password && formErrors.password && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                )}
              </div>

              {/* Login button and forgot password */}
              <div className="flex flex-col space-y-4">
                <button 
                  type="submit" 
                  className="w-full bg-[#7749F8] hover:bg-[#6a3de8] text-white py-3 rounded-md font-medium transition duration-200 flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {loading ? "Logging in..." : "Login"}
                </button>
                
                <div className="text-center">
                  <Link href="/forgot-password" className="text-sm text-[#7749F8] hover:text-[#6a3de8] transition">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="mt-6 text-center text-gray-400">
                Don't have an account?{' '}
                <Link href="/register" className="text-[#7749F8] hover:text-[#6a3de8] transition">
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
