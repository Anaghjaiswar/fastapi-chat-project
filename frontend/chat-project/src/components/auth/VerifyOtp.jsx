import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { verifyOtp } from '../../api/verifyOtp';
import styles from './VerifyOtp.module.css';

export default function VerifyOtp({ email, onNext, onBack }) {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  // autofocus first input
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (e, idx) => {
    const val = e.target.value;
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    setError('');
    if (val && idx < otp.length - 1) inputsRef.current[idx + 1].focus();
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
      await verifyOtp({ email, otp: code });
      onNext({ otpCode: code });
    } catch (err) {
      setError(err.detail || err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Enter OTP</h2>
      <p className={styles.description}>A 6-digit code was sent to {email}.</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.otpInputs}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              ref={(el) => (inputsRef.current[idx] = el)}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={styles.otpInput}
              aria-label={`Digit ${idx + 1}`}
            />
          ))}
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.buttonRow}>
          <button type="button" onClick={onBack} className={styles.backButton} disabled={loading}>
            Back
          </button>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>
    </div>
  );
}

VerifyOtp.propTypes = {
  email: PropTypes.string.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};