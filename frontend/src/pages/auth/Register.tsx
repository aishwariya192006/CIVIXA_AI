import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Mail, Lock, Phone, MapPin, Building, ArrowRight, AlertCircle } from 'lucide-react';

export const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    if (data.password !== data.confirmPassword) {
      setServerError('Passwords do not match');
      return;
    }
    
    try {
      setServerError('');
      setIsLoading(true);
      // Clean up confirm password before sending
      const payload = { ...data };
      delete payload.confirmPassword;
      
      const res = await api.post('/auth/register', payload);
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        navigate('/app');
      }
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12 relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-2xl p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an Account</h1>
          <p className="text-gray-500">Join CIVIXA AI to manage and track civic issues</p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="h-4 w-4" />
                </div>
                <input 
                  type="text" 
                  {...register("fullName", { required: "Name is required" })}
                  className="input-field pl-10"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input 
                  type="email" 
                  {...register("email", { required: "Email is required" })}
                  className="input-field pl-10"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input 
                  type="password" 
                  {...register("password", { required: "Password is required" })}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input 
                  type="password" 
                  {...register("confirmPassword", { required: "Confirm your password" })}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input 
                  type="text" 
                  {...register("contactNumber")}
                  className="input-field pl-10"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Building className="h-4 w-4" />
                </div>
                <input 
                  type="text" 
                  {...register("district")}
                  className="input-field pl-10"
                  placeholder="Central District"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Role</label>
              <select 
                {...register("role")}
                className="input-field"
                defaultValue="CITIZEN"
              >
                <option value="CITIZEN">Citizen</option>
                <option value="OFFICER">Officer</option>
                <option value="OFFICIAL">Higher Official</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none text-gray-400">
                <MapPin className="h-4 w-4" />
              </div>
              <textarea 
                {...register("address")}
                className="input-field pl-10 py-3 min-h-[100px]"
                placeholder="123 Civic Street, Suite 100"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full btn-primary flex justify-center items-center gap-2 py-3 mt-6 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isLoading ? 'Creating Account...' : (
              <>
                Complete Registration
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
