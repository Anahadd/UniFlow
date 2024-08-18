import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const MockInterviewFeedback = () => {
  const location = useLocation();
  const { recordings } = location.state || {};
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const formData = new FormData();
    recordings.forEach((recording, index) => {
      formData.append(`file${index + 1}`, recording, `question${index + 1}.webm`);
    });

    fetch('http://localhost:5000/analyze', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => setFeedback(data.feedback));
  }, [recordings]);

  return (
    <div>
      <h2>Your Interview Feedback</h2>
      <p>{feedback}</p>
    </div>
  );
};

export default MockInterviewFeedback;
