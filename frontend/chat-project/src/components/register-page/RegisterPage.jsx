import React, { useState } from 'react';
import './RegisterPage.css';
import { Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    username: '',
    password: '',
    promotions: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setErrors(errs => ({ ...errs, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullname) errs.fullname = 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Invalid email';
    if (!form.username) errs.username = 'Username is required';
    if (form.password.length < 8) errs.password = 'Password too short';
    return errs;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    // dispatch API call…
  };

  const passwordEntered = form.password.length > 0;
  
  return (
    <div className="RegisterPage">
      <div className="RegisterPage__form">
        <form onSubmit={handleSubmit} noValidate>
          <h2>Welcome to the chat community</h2>

          <label htmlFor="fullname">Full Name</label>
          <input
            id="fullname"
            name="fullname"
            type="text"
            value={form.fullname}
            onChange={handleChange}
            aria-invalid={!!errors.fullname}
          />
          {errors.fullname && <p className="error">{errors.fullname}</p>}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type='text'
            value={form.username}
            onChange={handleChange}
            aria-invalid={!!errors.username}
          />
          {errors.username && <p className="error">{errors.username}</p>}

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            aria-invalid={!!errors.password}
          />
          {errors.password && <p className="error">{errors.password}</p>}

          <fieldset className="password-rules">
            <legend>Password must contain:</legend>
            <ul>
              <li className={form.password.length >= 8 ? 'valid' : 'invalid'}>
                8 or more characters
              </li>
              <li className={/[A-Z]/.test(form.password) ? 'valid' : 'invalid'}>
                One uppercase letter
              </li>
              <li className={/[a-z]/.test(form.password) ? 'valid' : 'invalid'}>
                One lowercase letter
              </li>
              <li className={/[0-9]/.test(form.password) ? 'valid' : 'invalid'}>
                One number
              </li>
              <li
                className={
                  /[!@#$%^&*(),.?":{}|<>]/.test(form.password)
                    ? 'valid'
                    : 'invalid'
                }
              >
                One special character
              </li>
            </ul>
          </fieldset>

          <label className="promotions">
            <input
              type="checkbox"
              name="promotions"
              checked={form.promotions}
              onChange={handleChange}
            />
            <p className='promotions-text'>I want to receive emails about product updates and promotions.</p>
          </label>

          <p className="terms">
            By creating an account, you agree to our <a href="#">Terms</a> &{' '}
            <a href="#">Privacy Policy</a>.
          </p>

          <button type="submit" className="RegisterButton">
            Create account
          </button>

          <p className="login-direction">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>

      <div className="RegisterPage__image">
        <img
          src="https://res.cloudinary.com/dy1a8nyco/image/upload/v1746722301/qimgkyypfb9athj49thh.png"
          alt="Chat community illustration"
        />
      </div>
    </div>
  );
}
