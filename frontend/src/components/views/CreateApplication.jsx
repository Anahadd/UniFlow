import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';
import Layout from './Layout';
import { getAuth } from 'firebase/auth';
import background from "../icon/bg_app.svg";

// Global styles for font
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

  input, textarea, select {
    width: calc(100% - 20px);
    max-width: 700px;
    padding: 0.75rem;
    border-radius: 0.25rem;
    border: 1px solid #c0c4c9;
    font-size: 1rem;
    color: #ffffff; /* Updated text color to white */
    background-color: rgba(50, 50, 50, 0.7); /* Semi-transparent grey background */
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    resize: none;
  }

  input::placeholder, textarea::placeholder, select::placeholder {
    color: rgba(255, 255, 255, 0.7); /* Subtle white for placeholder text */
  }

  input:focus, textarea:focus, select:focus {
    border-color: rgba(255, 255, 255, 0.7);
    outline: none;
  }
`;

const TitleInput = styled.input`
  font-size: 1.2rem;
  font-weight: 500;
  color: #ffffff; /* Text color white */
  border: none;
  background: none;
  margin-bottom: 10px;
  width: 100%;
  margin-left: 50px;
  padding-right: 40px; /* Space for the delete button */
  word-wrap: break-word;
  white-space: normal;

  &:focus {
    outline: none;
    border-bottom: 1px solid #ffffff;
  }
`;

const ResponseTextarea = styled.textarea`
  width: 900px;
  max-width: 1000px;
  padding: 0.75rem;
  border-radius: 0.5rem; /* Smooth edge */
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 1rem;
  color: #ffffff; /* Text color white */
  margin-left: 50px;
  background-color: rgba(50, 50, 50, 0.7); /* Semi-transparent grey */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5); /* Black shadow for contrast */
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  resize: none;
  height: 500px;
  margin-bottom: 20px;
  font-family: 'Roboto', sans-serif; /* Professional font */

  &::placeholder {
    color: rgba(255, 255, 255, 0.7); /* Subtle white for placeholder text */
  }

  &:focus {
    border-color: rgba(255, 255, 255, 0.7); /* Softer focus effect */
    outline: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7); /* Enhanced shadow on focus */
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  margin-top: 10px;
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
  margin-top: 20px;

  &:hover {
    transform: scale(1.05);
  }
`;

const Title = styled.h1`
  color: #ffffff;
  margin-bottom: 30px;
  font-size: 36px;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  position: sticky;
  bottom: 10px;
`;

const CharacterCount = styled.div`
  text-align: left;
  font-size: 1rem;
  color: #ffffff;
  font-weight: bold;
  margin-left: 50px; 
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  font-size: 1.2rem;
  position: absolute;
  right: 45px;
  top: 0px;

  &:hover {
    transform: scale(1.05);
  }
`;

const QuestionContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1000px; 
  margin-bottom: 70px;
  padding-right: 40px; 
`;

const SavedMessage = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #3b4ce2;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 2rem;
  z-index: 1000;
  transition: opacity 0.5s ease-in-out;
`;

const CreateApplication = () => {
  const [email, setEmail] = useState('');
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      setEmail(user.email);
    } else {
      console.error('No user is signed in.');
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get_profile', {
          params: { email: user.email }
        });
        setUniversities(response.data.universities);
        setProfileLoaded(true);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, []);

  useEffect(() => {
    if (selectedUniversity) {
        const fetchApplication = async () => {
            try {
                const response = await axios.get('http://localhost:5000/get_application', {
                    params: { email, university: selectedUniversity }
                });
                if (response.data && response.data.responses) {
                    setQuestions(Object.keys(response.data.responses));
                    setResponses(response.data.responses);
                } else {
                    setQuestions([]);
                    setResponses({});
                }
            } catch (error) {
                console.error('Error fetching application:', error);
            }
        };
        fetchApplication();
    }
}, [selectedUniversity, email]);

  const addQuestion = () => {
    const newQuestion = `Q${questions.length + 1}`;
    setQuestions([...questions, newQuestion]);
    setResponses({ ...responses, [newQuestion]: '' });
  };

  const deleteQuestion = (index) => {
    const newQuestions = [...questions];
    const deletedQuestion = newQuestions.splice(index, 1)[0];
    const newResponses = { ...responses };
    delete newResponses[deletedQuestion];
    setQuestions(newQuestions);
    setResponses(newResponses);
  };

  const handleQuestionChange = (e, index) => {
    const newQuestions = [...questions];
    newQuestions[index] = e.target.value;
    setQuestions(newQuestions);
  };

  const handleResponseChange = (e) => {
    const { name, value } = e.target;
    setResponses((prevResponses) => ({
      ...prevResponses,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedResponses = {};
    questions.forEach((question) => {
        updatedResponses[question] = responses[question];
    });
    try {
        const response = await axios.post('http://localhost:5000/save_application', {
            email,
            university: selectedUniversity,  // Ensure this is the selected university
            responses: updatedResponses
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Application saved:', response.data);
        setMessage('Saved!');
        setTimeout(() => setMessage(''), 3000);
    } catch (error) {
        console.error('Error saving application:', error);
    }
};


  const getCharacterAndWordCount = (text = '') => {
    const characterCount = text.length;
    const wordCount = text.trim().split(/\s+/).length;
    return `${characterCount} characters, ${wordCount} words`;
  };

  return (
    <Layout>
      <GlobalStyle />
      <Container>
        <Title>Create Your Application</Title>
        {profileLoaded ? (
          <>
            <FormField>
              <label htmlFor="university">Select University</label>
              <select
                id="university"
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                required
              >
                <option value="" disabled>Select a university</option>
                {universities.map((university, index) => (
                  <option key={index} value={university}>{university}</option>
                ))}
              </select>
            </FormField>
            <form onSubmit={handleSubmit}>
              {questions.map((question, index) => (
                <QuestionContainer key={index}>
                  <TitleInput
                    type="text"
                    value={question}
                    onChange={(e) => handleQuestionChange(e, index)}
                    required
                  />
                  <DeleteButton type="button" onClick={() => deleteQuestion(index)}>Delete</DeleteButton>
                  <ResponseTextarea
                    id={question}
                    name={question}
                    value={responses[question]}
                    onChange={handleResponseChange}
                    required
                  />
                  <CharacterCount>
                    {getCharacterAndWordCount(responses[question])}
                  </CharacterCount>
                </QuestionContainer>
              ))}
              <ButtonContainer>
                <Button type="button" onClick={addQuestion}>Add Question</Button>
                <Button type="submit">Save Application</Button>
              </ButtonContainer>
              {message && <SavedMessage>{message}</SavedMessage>}
            </form>
          </>
        ) : (
          <p>Loading profile...</p>
        )}
      </Container>
    </Layout>
  );
};

export default CreateApplication;
