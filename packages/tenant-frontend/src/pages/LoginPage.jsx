import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

import { tenantAuthService } from '../services/api'; // Assume this service exists

// Import reusable components from our shared UI library
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-library';
import useAuth from '../context/useAuth';

const LoginPage = () => {
  // --- HOOKS INITIALIZATION ---
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Determine where to redirect after login. Defaults to the dashboard '/'.
  const from = location.state?.from?.pathname || '/';

  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    subdomain: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- HANDLERS ---
  const handleChange = (e) => {
    setError(''); // Clear previous errors on new input
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call the API service with the form data
      const loginPromise = tenantAuthService.login(formData.email, formData.password, formData.subdomain);

      // Use toast.promise to automatically handle loading, success, and error states
      const response = await toast.promise(loginPromise, {
        loading: t('common.buttons.saving'), // <-- 3. USE TRANSLATION IN TOASTS
        success: t('login.successMessage'),
        error: (err) => err.response?.data?.error || t('login.errorMessageDefault'),
      });

      // This code only runs if the promise was successful
      if (response.data.success && response.data.token) {
        login(response.data.token); //save the token in context
        console.log('Login successful! Redirecting...');
        const dashboardRes = await tenantAuthService.getDefaultDashboard();
        const { defaultUrl } = dashboardRes.data.data;
        //navigate(defaultUrl, { replace: true });
        navigate(from, { replace: true });
      }
    } catch (err) {
      // Set the error state with the message from the backend
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      console.error('Login API call failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-xl shadow-lg'>
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-bold text-white'>{t('login.title')}</h2>
          <p className='mt-2 text-sm text-slate-400'>{t('login.subtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className='mt-8 space-y-6' action='#' method='POST'>
          {error && <p className='text-red-400 text-center'>{error}</p>}
          <div className='rounded-md shadow-sm -space-y-px'>
            <div>
              <label htmlFor='subdomain' className='sr-only'>
                {t('login.subdomain_label', 'Shop Subdomain')}
              </label>
              <input
                id='subdomain'
                name='subdomain'
                type='text'
                value={formData.subdomain}
                onChange={handleChange}
                autoCapitalize='none'
                required
                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-700 bg-slate-900 placeholder-slate-400 text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
                placeholder={t('login.subdomain_placeholder')}
              />
            </div>
            <div>
              <label htmlFor='email-address' className='sr-only'>
                {t('login.email_label', 'Email Address')}
              </label>
              <input
                id='email-address'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleChange}
                autoComplete='email'
                required
                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-700 bg-slate-900 placeholder-slate-400 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
                placeholder={t('login.email_placeholder')}
              />
            </div>
            <div>
              <label htmlFor='password' className='sr-only'>
                {t('login.password_label', 'Password')}
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                value={formData.password}
                onChange={handleChange}
                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-700 bg-slate-900 placeholder-slate-400 text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
                placeholder='************'
              />
            </div>
          </div>
          <div>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? t('login.signing_in') : t('login.sign_in_button')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
