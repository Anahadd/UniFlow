import React, { useState, forwardRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Button } from './style.js';

const Container = styled.div`
  cursor: pointer;
  max-width: 350px;
  min-width: 350px; 
  height: 150px; 
  box-sizing: content-box;
  display: flex;
  align-items: center;
  padding: 0 32px;
  border-radius: 32px;
  margin: 12px 0; 
  transition-duration: 0.3s;
  background-color: #283130;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: scale(1.25);
    transition-duration: 0.3s;
    justify-content: space-between;
    ::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.5));
      transform: translateX(-100%) rotate(45deg);
      opacity: 0.5;
      pointer-events: none;
      animation: shine 0.75s ease-out forwards;
    }
  }

  &.active {
    transform: scale(1.33);
    background: #3E4746;
    margin: 32px 0;
    max-width: 350px;
    min-width: 350px;
  }

  button {
    background-color: var(--green);
    color: var(--black);
    padding: 12px 16px;
    border-radius: 12px;
    margin-left: 16px;
  }

  &.completed {
    background-color: #1D2625;
    opacity: 0.9;
  }

  p {
    margin: 0;
    color: var(--white);
    font-size: 25px; /* Increased font size */
    font-weight: 600;
    padding-bottom: 8px;
  }

  .graphic {
    flex: 0 0 auto;
    width: 75px; /* Adjusted icon size */
    height: 75px; /* Adjusted icon size */
    border-radius: 16px;
    margin-right: 16px; /* Adjusted margin */
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      width: 100%; /* Adjusted icon size */
      height: 100%; /* Adjusted icon size */
      border-radius: 16px;
      &.completed {
        padding: 0;
        width: 100%;
        height: 100%;
      }
    }
  }

  .title {
    flex: 1;
    display: flex;
    align-items: center;
  }
`;

const ApplicationFeature = forwardRef(({ feature, completed, active }, ref) => {
  const [isActive, setIsActive] = useState(active);
  const navigate = useNavigate();

  useEffect(() => {
    setIsActive(active);
  }, [active]);

  const handleClick = () => {
    switch (feature.id) {
      case 1:
        navigate('/create-application');
        break;
      case 2:
        navigate('/complete-profile');
        break;
      case 3:
        navigate('/essay-tips');
        break;
      case 4:
        navigate('/mock-interview');
        break;
      case 5:
        navigate('/scholarships');
        break;
      default:
        break;
    }
  };

  return (
    <Container
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => { if (!active) setIsActive(false); }}
      onClick={handleClick}
      ref={ref}
      className={`${completed ? 'completed' : ''} ${isActive ? 'active' : ''}`}
    >
      <div className="graphic">
        {!completed && <img src={feature.icon} alt="thumbnail" />}
      </div>
      <div className="title">
        <p>{feature.title}</p>
      </div>
      {isActive && <Button className="primary">{completed ? 'Edit' : 'Start'}</Button>}
    </Container>
  );
});

export default ApplicationFeature;  