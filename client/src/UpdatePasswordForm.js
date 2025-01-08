import React, { useState } from 'react';
import axios from 'axios';
import { HiMiniEye } from "react-icons/hi2";
import { BsFillEyeSlashFill } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';

const UpdatePasswordForm = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 const navigate=useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form inputs
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }
    setError('');

    try {
      const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/update-password`, {
        email, // Use the email instead of currentPassword
        password: newPassword,
      });
      
     
      
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
      if(response.status===200){
         // console.log('Password updated:', response.data);
      setTimeout(()=>{
        setSuccess('Password updated successfully.');
      },[2000])
        navigate('/')
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Failed to update password.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4">
        <h2 className="text-center mb-4">Update Password</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label">New Password</label>
            <div className="input-group">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-group-text"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
               { showNewPassword ? <HiMiniEye/> : <BsFillEyeSlashFill/> }
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
            <div className="input-group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-group-text"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                { showConfirmPassword ? <HiMiniEye/> : <BsFillEyeSlashFill/> }
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100">Update</button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordForm;
