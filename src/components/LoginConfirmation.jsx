import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { fetchUserData } from '../store/Slices/userSlice';
import { Container, Spinner } from 'react-bootstrap';
import { showToast } from './SimpleToast';

const LoginConfirmation = () => {
  const { user } = useAuth();
  const currentUser = useSelector(state => state.user.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserStatus = async () => {
      if (user && !currentUser) {
        try {
          await dispatch(fetchUserData(user.uid)).unwrap();
          showToast("Login successful!", 'success', 3000);
          navigate('/');
        } catch (error) {
          console.error("Error loading user data:", error);
          showToast("Error loading user data. Please try again.", 'error', 3000);
          navigate('/login');
        }
      } else if (user && currentUser) {
        navigate('/');
      } else if (!user) {
        navigate('/login');
      }
    };

    checkUserStatus();
  }, [user, currentUser, dispatch, navigate]);

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
      <Spinner animation="border" role="status" variant="primary" />
      <h3 className="mt-3">Completing login...</h3>
      <p className="text-muted">Please wait while we prepare your account.</p>
    </Container>
  );
};

export default LoginConfirmation;