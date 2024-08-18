import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Layout from './Layout';
import background from '../icon/complete_profile.svg';  // Make sure the path is correct

// Re-use the moveBackground keyframe and styled components
const moveBackground = keyframes`
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: var(--bg);
  border-radius: 8px;
  background-image: url(${background});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0% 0%;
  animation: ${moveBackground} 30s linear infinite;
  height: 100vh;
`;

const FormField = styled.div`
  margin-bottom: 20px;
  width: 100%;

  label {
    display: block;
    margin-bottom: 8px;
    color: #ffffff;
    font-weight: 500;
    font-size: 1rem;
  }

  select {
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.25rem;
    border: 1px solid #c0c4c9;
    font-size: 1rem;
    color: #20242f;
    background-color: #f9fafb;
    transition: border-color 0.2s ease-in-out;
  }

  select::placeholder {
    color: #929292;
  }

  select:focus {
    border-color: #3b4ce2;
    outline: none;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #3b4ce2;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  transition: transform 0.3s ease-in-out;
  margin-top: 20px;

  &:hover {
    transform: scale(1.05);
  }
`;

const Title = styled.h1`
  color: #ffffff;
  margin-bottom: 20px;
`;

const MockInterviewForm = () => {
  const universities = [
    'University of Waterloo',
    'University of Toronto',
    'McMaster University',
    'Queen\'s University',
    'Toronto Metropolitan University',
    'York University',
    'Guelph University'
  ];

  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [numQuestions, setNumQuestions] = useState(1);
  const navigate = useNavigate();

  const handleUniversityChange = (e) => {
    setSelectedUniversity(e.target.value);
  };

  const handleNumQuestionsChange = (e) => {
    setNumQuestions(e.target.value);
  };

  const handleStart = () => {
    navigate('/mock-interview/session', { state: { selectedUniversity, numQuestions } });
  };

  return (
    <Layout>
      <Container>
        <Title>Start Your Mock Interview</Title>
        <FormField>
          <label htmlFor="university">Select a university for your mock interview:</label>
          <select id="university" value={selectedUniversity} onChange={handleUniversityChange}>
            <option value="" disabled>Select a university</option>
            {universities.map((university, index) => (
              <option key={index} value={university}>
                {university}
              </option>
            ))}
          </select>
        </FormField>

        <FormField>
          <label htmlFor="numQuestions">How many questions would you like?</label>
          <select id="numQuestions" value={numQuestions} onChange={handleNumQuestionsChange}>
            {[1, 2, 3, 4, 5].map(number => (
              <option key={number} value={number}>
                {number} {number === 1 ? 'question' : 'questions'}
              </option>
            ))}
          </select>
        </FormField>

        <Button onClick={handleStart} disabled={!selectedUniversity}>
          Start Interview
        </Button>
      </Container>
    </Layout>
  );
};

export default MockInterviewForm;
