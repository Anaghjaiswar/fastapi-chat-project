import styles from './LoginPage.module.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/login';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setErrors((errs) => ({ ...errs, [name]: null }));
    setGeneralError('');
  };

  const validate = () => {
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    const fieldErrs = validate();
    if (Object.keys(fieldErrs).length) {
      setErrors(fieldErrs);
      return;
    }
    
    setLoading(true)
    try{
        const { user_id } = await loginUser({ email: form.email, password: form.password });
        localStorage.setItem("userId", user_id);

        navigate('/chat');
    } catch (err) {
      setGeneralError(err.message);
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.LoginPage}>
      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <h2 className={styles.heading}>Welcome Back, Log In</h2>

        <label htmlFor="email" className={styles.label}>Email</label>
        <input
          type="email"
          name="email"
          id="email"
          className={`${styles.input} ${errors.email ? styles.invalid : ''}`}
          value={form.email}
          onChange={handleChange}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className={styles.error}>{errors.email}</p>
        )}

        <label htmlFor="password" className={styles.label}>Password</label>
        <input
          id="password"
          name="password"
          type="password"
          className={`${styles.input} ${errors.password ? styles.invalid : ''}`}
          value={form.password}
          onChange={handleChange}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p id="password-error" className={styles.error}>{errors.password}</p>
        )}
        {generalError && <p className={styles.error}>{generalError}</p>}

        <button type="submit" className={styles.LoginButton} disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <div className={styles.rememberMe}>
          <input
            type="checkbox"
            name="remember"
            id="remember"
            checked={form.remember}
            onChange={handleChange}
            className={styles.checkbox}
          />
          <label htmlFor="remember" className={styles.checkboxLabel}>
            Remember me
          </label>

        </div>

        <p className={styles.signupDirection}>
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}
