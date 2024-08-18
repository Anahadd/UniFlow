import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import Layout from './Layout';
import background from '../icon/complete_profile.svg';

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

  input, select {
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.25rem;
    border: 1px solid #c0c4c9;
    font-size: 1rem;
    color: #20242f;
    background-color: #f9fafb;
    transition: border-color 0.2s ease-in-out;
  }

  input::placeholder, select::placeholder {
    color: #929292;
  }

  input:focus, select:focus {
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

const FormRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 20px;

  & > ${FormField} {
    flex: 1;
  }
`;

const CheckboxGroup = styled.div`
  margin-top: 30px;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;

  label {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    color: #ffffff;
    font-size: 1.2rem;
    text-transform: uppercase;

    input {
      margin-right: 10px;
      width: 1.5rem;
      height: 1.5rem;
    }
  }
`;

const Title = styled.h1`
  color: #ffffff;
  margin-bottom: 20px;
`;

const CheckboxLabel = styled.label`
  width: 100%;
  text-align: center;
  color: #ffffff;
  font-size: 1.2rem;
  margin-bottom: 10px;
`;

const universities = [
  'University of Waterloo',
  'University of Toronto',
  'McMaster University',
  'Queen\'s University',
  'Toronto Metropolitan University',
  'York University',
  'Guelph University'
];

const CompleteProfile = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [resume, setResume] = useState(null);
  const [study, setStudy] = useState('');
  const [selectedUniversities, setSelectedUniversities] = useState([]);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleUniversityChange = (e) => {
    const { value, checked } = e.target;
    setSelectedUniversities(prev =>
      checked ? [...prev, value] : prev.filter(univ => univ !== value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('email', email);
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('study', study);
    formData.append('universities', JSON.stringify(selectedUniversities));
    formData.append('resume', resume);

    try {
      const response = await axios.post('http://localhost:5000/save_profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Profile saved:', response.data);
      setProfileSaved(true);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <Layout>
      <Container>
        <Title>Complete Your Profile</Title>
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>
            <FormField>
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </FormField>
            <FormField>
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField>
              <label htmlFor="resume">Resume</label>
              <input
                id="resume"
                type="file"
                onChange={(e) => setResume(e.target.files[0])}
                required
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField>
              <label htmlFor="study">Field of Study</label>
              <select
                id="study"
                value={study}
                onChange={(e) => setStudy(e.target.value)}
                required
              >
                <option value="" disabled>Select your field of study</option>
                <option value="Arts">Arts</option>
                <option value="Engineering">Engineering</option>
                <option value="Science">Science</option>
                <option value="Business">Business</option>
                <option value="Law">Law</option>
                <option value="Medicine">Medicine</option>
                <option value="Social Sciences">Social Sciences</option>
              </select>
            </FormField>
          </FormRow>
          <CheckboxLabel>Select the universities you're applying to</CheckboxLabel>
          <CheckboxGroup>
            {universities.map((university, index) => (
              <label key={index}>
                <input
                  type="checkbox"
                  value={university}
                  onChange={handleUniversityChange}
                />
                {university}
              </label>
            ))}
          </CheckboxGroup>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button type="submit">Save Profile</Button>
          </div>
          {profileSaved && <p style={{ color: 'white' }}>User Information Updated</p>}
        </form>
      </Container>
    </Layout>
  );
};

export default CompleteProfile;
