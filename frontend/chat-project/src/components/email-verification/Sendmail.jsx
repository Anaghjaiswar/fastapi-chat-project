import { useState } from "react";
import { sendVerificationMail } from "../../api/sendVerificationMail";
import { useNavigate } from "react-router-dom";
import styles from './Sendmail.module.css';

export default function Sendmail() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    setError(""); // Clear error when typing
    setGeneralError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await sendVerificationMail({email});
      navigate("/verify-email", { state: { email } });
    } catch (err) {
      setGeneralError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <h2 className={styles.heading}>Enter E-mail Address</h2>
        <p className={styles.description}>
          enter the email address associated with your account.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <fieldset className={styles.fieldset}>

            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleInputChange}
              className={`${styles.input} ${error ? styles.invalid : ""}`}
              aria-invalid={!!error}
              aria-describedby={error ? "email-error" : undefined}
              placeholder="Enter your email"
            />
            {error && (
              <p id="email-error" className={styles.error}>
                {error}
              </p>
            )}
            {generalError && <p className={styles.error}>{generalError}</p>}
          </fieldset>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Sending mail..." : "Send OTP"}
          </button>
        </form>
      </div>
    </>
  );
}
