import React from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import styled from 'styled-components';
import BackgroundImage from '../icon/LandingPage.svg';
import TitleSVG from '../icon/Title.svg';
import ParagraphSVG from '../icon/paragraph.svg';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Align items to the left */
  justify-content: center;
  height: 100vh;
  width: 100%;
  padding-left: 2%; /* Adjust this value to move the content to the left */
  background-image: url(${BackgroundImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  text-align: left; /* Align text to the left */
`;

const Title = styled.img`
  width: 300%; /* Increase the width to make it bigger */
  max-width: 950px; /* Increase max-width for larger displays */
  margin-bottom: 20px;
`;

const Paragraph = styled.img`
  width: 110%; /* Adjust as needed */
  max-width: 900px; /* Increase max-width for larger displays */
  margin-bottom: 40px;
`;

const PushableButton = styled.button`
  position: relative;
  background: transparent;
  padding: 0px;
  border: none;
  cursor: pointer;
  outline-offset: 4px;
  outline-color: deeppink;
  transition: filter 250ms;
  -webkit-tap-highlight-color: #FF0066;

  &:hover {
    filter: brightness(110%);
  }

  &:hover .front {
    transform: translateY(-6px);
    transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
  }

  &:active .front {
    transform: translateY(-2px);
    transition: transform 34ms;
  }

  &:hover .shadow {
    transform: translateY(4px);
    transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
  }

  &:active .shadow {
    transform: translateY(1px);
    transition: transform 34ms;
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }
`;

const Shadow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: hsl(226, 25%, 69%);
  border-radius: 8px;
  filter: blur(2px);
  will-change: transform;
  transform: translateY(2px);
  transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
`;

const Edge = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  border-radius: 8px;
  background: linear-gradient(
    to right,
    #FF0066 0%,
    #FF0066 8%,
    #FF0066 92%,
    #FF0066 100%
  );
`;

const Front = styled.span`
  display: block;
  position: relative;
  border-radius: 8px;
  background: #FF0066;
  padding: 16px 32px;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 1rem;
  transform: translateY(-4px);
  transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
`;

const Login = () => {
  const signInWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result.user);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  return (
    <Container>
      <Title src={TitleSVG} alt="Landing Page Title" />
      <Paragraph src={ParagraphSVG} alt="Landing Page Paragraph" />
      <PushableButton onClick={signInWithGoogle} className="pushable">
        <Shadow className="shadow" />
        <Edge className="edge" />
        <Front className="front">Sign in with Google</Front>
      </PushableButton>
    </Container>
  );
};

export default Login;
