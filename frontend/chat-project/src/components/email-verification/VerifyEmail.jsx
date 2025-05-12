// src/components/verify-email/VerifyEmail.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './VerifyEmail.module.css';
import { verifyEmail } from '../../api/verifyEmail';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  // Auto-focus first box on mount
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (e, idx) => {
    const val = e.target.value;
    if (!/^\d?$/.test(val)) return;  // only digit or empty

    const nextOtp = [...otp];
    nextOtp[idx] = val;
    setOtp(nextOtp);
    setError('');

    // Move focus forward
    if (val && idx < otp.length - 1) {
      inputsRef.current[idx + 1].focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail({ email, otp: code });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Verify Your Email</h2>
      <p className={styles.subheading}>We’ve sent a 6-digit code to {email}</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.otpInputs}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              inputMode="numeric"
              maxLength="1"
              className={styles.otpInput}
              value={digit}
              ref={(el) => (inputsRef.current[idx] = el)}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              aria-label={`Digit ${idx + 1}`}
            />
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
    </div>
  );
}
