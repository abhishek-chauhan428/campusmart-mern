import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, School, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

const campuses = [
  'Delhi Technological University',
  'IIT Delhi',
  'BITS Pilani',
  'Manipal Institute of Tech',
  'VIT Vellore',
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) setErrorMessage('');
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const handleSelectCampus = (campusName) => {
    setFormData((prev) => ({ ...prev, college: campusName }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setValidationErrors([]);

    // Client-side validations
    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      college: formData.college,
      password: formData.password,
    });
    setLoading(false);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setErrorMessage(result.message);
      if (result.errors) {
        setValidationErrors(result.errors);
      }
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 4.25rem)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.12) 0%, transparent 70%)'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--brand-gradient-subtle)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            marginBottom: '0.75rem'
          }}>
            <Sparkles size={14} color="#818cf8" />
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#a5b4fc' }}>
              Join Campus Community
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Create Your Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Trade safely with students from your campus
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="alert alert-error animate-fade-in" style={{ display: 'flex', alignItems: 'center' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Validation Errors List */}
        {validationErrors.length > 0 && (
          <div className="alert alert-error animate-fade-in" style={{ flexDirection: 'column', gap: '0.25rem' }}>
            {validationErrors.map((err, idx) => (
              <div key={idx} style={{ fontSize: '0.8125rem' }}>• {err.message}</div>
            ))}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="form-input"
                placeholder="Abhishek Chauhan"
                value={formData.name}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="name"
              />
              <User
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Campus Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="form-input"
                placeholder="student@campus.edu"
                value={formData.email}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="email"
              />
              <Mail
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="college">
              Campus / College / University
            </label>
            <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
              <input
                id="college"
                name="college"
                type="text"
                required
                className="form-input"
                placeholder="e.g. Delhi Technological University"
                value={formData.college}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
              />
              <School
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            
            {/* Quick Campus Chips */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {campuses.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => handleSelectCampus(c)}
                  style={{
                    background: formData.college === c ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: formData.college === c ? '#a5b4fc' : 'var(--text-muted)',
                    border: formData.college === c ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.15rem 0.5rem',
                    fontSize: '0.7rem',
                    cursor: 'pointer'
                  }}
                >
                  {c.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password (min 6 characters)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                autoComplete="new-password"
              />
              <Lock
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="new-password"
              />
              <Lock
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', marginTop: '0.75rem', fontSize: '0.9375rem' }}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--brand-primary)', fontWeight: '600' }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
