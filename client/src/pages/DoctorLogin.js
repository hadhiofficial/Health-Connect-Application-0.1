import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doctorAPI } from '../services/api';

function DoctorLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await doctorAPI.login(formData);
      localStorage.setItem('user', JSON.stringify(response.data.doctor));
      localStorage.setItem('userType', 'doctor');
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="navbar">
        <h2>🏥 HealthConnect</h2>
        <Link to="/">
          <button className="btn" style={{ background: 'white', color: '#007bff' }}>
            Back to Home
          </button>
        </Link>
      </div>
      
      <div className="container" style={{ maxWidth: '500px', marginTop: '50px' }}>
        <div className="card">
          <h2 style={{ textAlign: 'center', color: '#007bff', marginBottom: '30px' }}>
            Doctor Login
          </h2>
          
          {error && <div className="error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            Don't have an account?{' '}
            <Link to="/doctor/register" style={{ color: '#007bff' }}>
              Register here
            </Link>
          </p>
          
        </div>
      </div>
    </div>
  );
}

export default DoctorLogin;
