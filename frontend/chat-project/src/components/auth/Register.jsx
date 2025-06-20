import { useState } from 'react';
import PropTypes from 'prop-types';
// import { registerUser } from '../../api/register';
import styles from './Register.module.css';
import { registerUser } from '../../api/register';

export default function Register({ email, onBack, onNext }) {
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    password: '',
    promotions: false,
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(errs => ({ ...errs, [name]: null }));
    setGeneralError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (!form.username.trim()) errs.username = 'Username is required';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = await registerUser({ ...form, email });
      // Store tokens if returned by backend
      if (payload.access_token && payload.refresh_token) {
        localStorage.setItem("access_token", payload.access_token);
        localStorage.setItem("refresh_token", payload.refresh_token);
      }
      onNext(); // registration successful, parent can navigate
    } catch (err) {
      setGeneralError(err.detail || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Create Your Account</h2>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <label htmlFor="full_name">Full Name</label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          value={form.full_name}
          onChange={handleChange}
          aria-invalid={!!errors.full_name}
          className={errors.full_name ? styles.invalid : ''}
        />
        {errors.full_name && <p className={styles.error}>{errors.full_name}</p>}

        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          aria-invalid={!!errors.username}
          className={errors.username ? styles.invalid : ''}
        />
        {errors.username && <p className={styles.error}>{errors.username}</p>}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          aria-invalid={!!errors.password}
          className={errors.password ? styles.invalid : ''}
        />
        {errors.password && <p className={styles.error}>{errors.password}</p>}

        <label className={styles.promotions}>
          <input
            type="checkbox"
            name="promotions"
            checked={form.promotions}
            onChange={handleChange}
          />
          <span>I want to receive product updates & promotions</span>
        </label>

        {generalError && <p className={styles.error}>{generalError}</p>}

        <div className={styles.buttonRow}>
          <button
            type="button"
            onClick={onBack}
            className={styles.backButton}
            disabled={loading}
          >
            Back
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
}

Register.propTypes = {
  email: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};