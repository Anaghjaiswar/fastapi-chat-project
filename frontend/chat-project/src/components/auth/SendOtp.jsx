import { useState } from "react";
import PropTypes from 'prop-types';
import { sendOtp } from "../../api/sendOtp";
import styles from './SendOtp.module.css';

export default function SendOtp({ onNext }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  // handle input change and clear errors
  const handleInputChange = (e) => {
    setEmail(e.target.value);
    setError("");
    setGeneralError("");
  };

  // form submission: validate and call sendOtp endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();

    // simple email regex validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      // call API; expect server to send OTP via email
      await sendOtp({ email });
      // on successful send, advance to next step
      onNext({ email });
    } catch (err) {
      // show error message from API or generic fallback
      setGeneralError(err.detail || err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Enter your Email</h2>
      <p className={styles.description}>Please enter your email to receive an OTP.</p>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <fieldset className={styles.fieldset} disabled={loading}>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleInputChange}
            className={`${styles.input} ${error ? styles.invalid : ""}`}
            aria-invalid={!!error}
            aria-describedby={error ? "email-error" : undefined}
            placeholder="you@gmail.com"
          />
          {error && (
            <p id="email-error" className={styles.error}>
              {error}
            </p>
          )}
          {generalError && (
            <p className={styles.error}>
              {generalError}
            </p>
          )}
          <button type="submit" className={styles.submitButton}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}

SendOtp.propTypes = {
  onNext: PropTypes.func.isRequired,
};