import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Layout from './Layout';
import { getAuth } from 'firebase/auth';
import background from "../icon/bg_app.svg";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: var(--bg);
  border-radius: 8px;
  min-height: 100vh;
  width: 100%;
  background-image: url(${background});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  overflow-y: auto;
`;

const Title = styled.h1`
  color: #ffffff;
  margin-bottom: 30px;
  font-size: 36px;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const ScholarshipCard = styled.div`
  background-color: rgba(50, 50, 50, 0.7);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 800px;
  color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ScholarshipTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 10px;
`;

const ScholarshipInfo = styled.p`
  margin-bottom: 5px;
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

  &:hover {
    transform: scale(1.05);
  }
`;

const ScholarshipMatching = () => {
  const [email, setEmail] = useState('');
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      setEmail(user.email);
      fetchMatchingScholarships(user.email);
    } else {
      console.error('No user is signed in.');
      setLoading(false);
    }
  }, []);

  const fetchMatchingScholarships = async (userEmail) => {
    try {
      const response = await axios.get('http://localhost:5000/get_matching_scholarships', {
        params: { email: userEmail }
      });
      setScholarships(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching matching scholarships:', error);
      setLoading(false);
    }
  };

  const updateScholarshipStatus = async (scholarshipId, status) => {
    try {
      await axios.post('http://localhost:5000/update_scholarship_status', {
        email,
        scholarshipId,
        status
      });
      // Update local state to reflect the change
      setScholarships(scholarships.map(s => 
        s._id === scholarshipId ? {...s, status} : s
      ));
    } catch (error) {
      console.error('Error updating scholarship status:', error);
    }
  };

  if (loading) {
    return <Container><Title>Loading scholarships...</Title></Container>;
  }

  return (
    <Layout>
      <Container>
        <Title>Matching Scholarships</Title>
        {scholarships.length === 0 ? (
          <ScholarshipInfo>No matching scholarships found.</ScholarshipInfo>
        ) : (
          scholarships.map(scholarship => (
            <ScholarshipCard key={scholarship._id}>
              <ScholarshipTitle>{scholarship.title}</ScholarshipTitle>
              <ScholarshipInfo>Amount: ${scholarship.amount}</ScholarshipInfo>
              <ScholarshipInfo>Deadline: {scholarship.deadline}</ScholarshipInfo>
              <ScholarshipInfo>{scholarship.description}</ScholarshipInfo>
              <Button onClick={() => updateScholarshipStatus(scholarship._id, 'saved')}>
                Save
              </Button>
              <Button onClick={() => updateScholarshipStatus(scholarship._id, 'applied')}>
                Mark as Applied
              </Button>
            </ScholarshipCard>
          ))
        )}
      </Container>
    </Layout>
  );
};

export default ScholarshipMatching;