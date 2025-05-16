// Auth.jsx
import { useState } from 'react';
import SendOtp from './SendOtp';
import VerifyOtp from './VerifyOtp';
import Register from './Register';
import styles from './Auth.module.css';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  // 0 = send OTP, 1 = verify OTP, 2 = register
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');      // carry the user’s email
  const [otpToken, setOtpToken] = useState(''); // if you need a server-side token
  const navigate = useNavigate();

  return (
    <div className={styles.authBox}>
      <div className={styles.flowBox}>
        { [0,1,2].map((i) => (
            <div
              key={i}
              className={`${styles.circle} ${step === i ? styles.active : ''}`}
            />
          ))
        }
      </div>

      <div className={styles.container}>
        {step === 0 && (
          <SendOtp
            onNext={({ email: e }) => {
              setEmail(e);
              setStep(1);
            }}
          />
        )}

        {step === 1 && (
          <VerifyOtp
            email={email}
            onNext={({ otpToken: token }) => {
              setOtpToken(token);
              setStep(2);
            }}
            onBack={() => setStep(0)}
          />
        )}

        {step === 2 && (
          <Register
            email={email}
            otpToken={otpToken}
            onBack={() => setStep(1)}
            onNext={() => navigate('/chat')}
          />
        )}
      </div>
    </div>
  );
}
