  import React, { useState, useEffect } from 'react';
  import styled, { createGlobalStyle } from 'styled-components';
  import axios from 'axios';
  import Layout from './Layout'; 
  import { getAuth } from 'firebase/auth';
  import background from "../icon/bg_app.svg";

  const GlobalStyle = createGlobalStyle`
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

    body {
      font-family: 'Roboto', sans-serif;
    }
  `;

  const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background-color: var(--bg);
    border-radius: 8px;
    height: 100vh;
    width: 100%;
    background-image: url(${background});
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center; /* Center the background image */
    overflow-y: auto;
  `;

  const FormField = styled.div`
    margin-bottom: 40px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    label {
      color: #ffffff;
      font-weight: 500;
      font-size: 1.3rem;
      margin-bottom: 8px;
    }

    select {
      width: calc(100% - 20px);
      max-width: 700px;
      padding: 0.75rem;
      border-radius: 0.25rem;
      border: 1px solid #c0c4c9;
      font-size: 1rem;
      color: #ffffff;
      background-color: rgba(50, 50, 50, 0.7);
      transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    select:focus {
      border-color: rgba(255, 255, 255, 0.7);
      outline: none;
    }
  `;

  const Button = styled.button`
    padding: 10px 20px;
    background-color: rgba(59, 76, 226, 0.8);
    color: #ffffff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    transition: transform 0.3s ease-in-out;

    &:hover {
      transform: scale(1.05);
    }
  `;

  const FeedbackContainer = styled.div`
    margin-top: 30px;
    padding: 20px;
    background-color: rgba(50, 50, 50, 0.7);
    border-radius: 8px;
    color: #ffffff;
    font-size: 1.2rem;
    line-height: 1.6;
    max-width: 700px;
  `;

  const Title = styled.h1`
    color: #ffffff;
    margin-bottom: 30px;
    font-size: 36px;
    font-weight: 700;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  `;

  const EssayCoaching = () => {
    const [email, setEmail] = useState('');
    const [universities, setUniversities] = useState([]);
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState('');
    const [feedback, setFeedback] = useState('');
    useEffect(() => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        setEmail(user.email);
        fetchProfile(user.email);
      } else {
        console.error('No user is signed in.');
      }
    }, []);

    const fetchProfile = async (email) => {
      try {
        const response = await axios.get('http://localhost:5000/get_profile', {
          params: { email }
        });

        setUniversities(response.data.universities || []);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    const fetchQuestions = async () => {
      if (!selectedUniversity) return;

      try {
        const response = await axios.get('http://localhost:5000/get_application', {
          params: { email, university: selectedUniversity }
        });

        const fetchedQuestions = response.data.responses ? Object.keys(response.data.responses) : [];
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    const analyzeEssay = async () => {
      try {
        const response = await axios.post('http://localhost:5000/analyze_essay', {
          email,
          university: selectedUniversity,
          question: selectedQuestion,
        });
    
        setFeedback(response.data.feedback);
      } catch (error) {
        console.error('Error analyzing essay:', error);
      }
    };
    

    return (
      <Layout>
        <GlobalStyle />
        <Container>
          <Title>AI Essay Coaching</Title>
          <FormField>
            <label htmlFor="university">Select University</label>
            <select
              id="university"
              value={selectedUniversity}
              onChange={(e) => {
                setSelectedUniversity(e.target.value);
                fetchQuestions();
              }}
              required
            >
              <option value="" disabled>Select a university</option>
              {universities.map((university, index) => (
                <option key={index} value={university}>{university}</option>
              ))}
            </select>
          </FormField>

          {questions.length > 0 && (
            <FormField>
              <label htmlFor="question">Select Question</label>
              <select
                id="question"
                value={selectedQuestion}
                onChange={(e) => setSelectedQuestion(e.target.value)}
                required
              >
                <option value="" disabled>Select a question</option>
                {questions.map((question, index) => (
                  <option key={index} value={question}>{question}</option>
                ))}
              </select>
            </FormField>
          )}

          {selectedQuestion && (
            <Button onClick={analyzeEssay}>Analyze Essay</Button>
          )}

          {feedback && (
            <FeedbackContainer>
              <h3>AI Feedback:</h3>
              <p>{feedback}</p>
            </FeedbackContainer>
          )}
        </Container>
      </Layout>
    );
  };

  export default EssayCoaching;
