import React from "react";
import styled, { keyframes } from "styled-components";
import background from "../icon/background.svg";
import image_1 from "../icon/book.png";
import image_2 from "../icon/note.png";
import image_3 from "../icon/tips.png";    
import image_4 from "../icon/call.png";
import image_5 from "../icon/eye.png";
import ApplicationFeature from "./ApplicationFeature";
import Layout from "./Layout";

const Details = styled.div`
  background-color: var(--bg);  
  width: 600px;
  height: calc(100vh - 64px);
  overflow-y: scroll;
  box-sizing: content-box;
  padding: 32px;
  margin-right: 32px;
  border-left: 1px solid var(--grey);
`;

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

const FeaturesWrapper = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow-y: scroll;
  background-color: var(--bg);
  position: relative;
  background-image: url(${background});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0% 0%;
  animation: ${moveBackground} 30s linear infinite;
  
  .head {
    position: sticky;
    z-index: 3;
    top: 0;
    padding: 32px;
    background-color: var(--bg);
    font-family: 'Arial', sans-serif;
    &.in {
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
    }

    h1 {
      font-size: 36px; 
      font-weight: 700; 
      color: #ffffff; 
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); 
      margin: 0;
    }

    h2 {
      font-size: 24px; 
      font-weight: 400; 
      color: #d0d0d0; 
      margin: 4px 0 0 0;
    }
  }

  .features-section {
    padding: 32px;
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: -10px; 
    margin-bottom: 16px;

    h2 {
      font-size: 33px; 
      font-weight: 700; 
      color: #ffffff; 
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); 
      margin-bottom: 16px;
    }
  }
`;

const Button = styled.button`
  padding: 15px;
  border-radius: 32px;
  border: none;
  background-color: var(--hilight);
  color: black;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 32px;

  &:hover {
    background-color: var(--teal);
  }
`;

const applicationFeatures = {
  createApplication: [
    { id: 2, title: 'Complete Your Profile', description: 'Fill in all necessary details to complete your profile.', icon: image_2 },
    { id: 1, title: 'Create Your Application', description: 'Step-by-step guide to create your application.', icon: image_1 },
  ],
  aiTips: [
    { id: 3, title: 'Essay Tips & Real-Time Coaching', description: 'Get feedback and coaching from AI.', icon: image_3 },
  ],
  mockInterview: [
    { id: 4, title: 'Schedule a Mock Interview with AI', description: 'Prepare for your interviews with mock sessions.', icon: image_4 },
  ],
  scholarships: [
    { id: 5, title: 'Scholarships and Financial Aid', description: 'Search and apply for scholarships.', icon: image_5 },
  ],
};

const Dashboard = () => {
  return (
    <Layout>
    <div className="section-view">
      <FeaturesWrapper>
        <div className="head">
          <h1>User Dashboard</h1>
        </div>

        <div className="features-section">
          <h2>Create Application</h2>
          {applicationFeatures.createApplication.map((feature, index) => (
            <ApplicationFeature
              key={feature.id}
              active={false}
              completed={false}
              feature={feature}
            />
          ))}
        </div>

        <div className="features-section">
          <h2>AI Tips / Coaching</h2>
          {applicationFeatures.aiTips.map((feature, index) => (
            <ApplicationFeature
              key={feature.id}
              active={false}
              completed={false}
              feature={feature}
            />
          ))}
        </div>

        <div className="features-section">
          <h2>Mock Interview</h2>
          {applicationFeatures.mockInterview.map((feature, index) => (
            <ApplicationFeature
              key={feature.id}
              active={false}
              completed={false}
              feature={feature}
            />
          ))}
        </div>

        <div className="features-section">
          <h2>Scholarships</h2>
          {applicationFeatures.scholarships.map((feature, index) => (
            <ApplicationFeature
              key={feature.id}
              active={false}
              completed={false}
              feature={feature}
            />
          ))}
        </div>
      </FeaturesWrapper>
    </div>
    </Layout>
  );
};

export default Dashboard;
