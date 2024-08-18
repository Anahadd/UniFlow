import React from 'react';
import styled from 'styled-components';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';

const SignOutButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #FF0066;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  outline: none;
  z-index: 1000; /* Ensure the button is on top */

  &:hover {
    transform: scale(1.05);
    transition-duration: 0.3s;
  }
`;

const BackButton = styled.button`
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: #FF0066;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  outline: none;
  z-index: 1000; 

  &:hover {
    transform: scale(1.05);
    transition-duration: 0.3s;
  }
`;

const LayoutContainer = styled.div`
  position: relative;
  min-height: 100vh; /* Ensure the layout takes full height */
`;

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      console.log("User signed out");
      navigate('/login');  
    }).catch((error) => {
      console.error("Error signing out: ", error);
    });
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <LayoutContainer>
      {children}
      <SignOutButton onClick={handleSignOut}>Sign Out</SignOutButton>
      {location.pathname !== '/dashboard' && location.pathname !== '/login' && (
        <BackButton onClick={handleBack}>Back</BackButton>
      )}
    </LayoutContainer>
  );
};

export default Layout;
