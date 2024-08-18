import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
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
  justify-content: center;
  height: 100vh;
  padding: 20px;
  background-color: var(--bg);
  border-radius: 8px;
  background-image: url(${background});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0% 0%;
  animation: ${moveBackground} 30s linear infinite;
`;

const QuestionPrompt = styled.h2`
  color: #ffffff;
  font-size: 2.2rem;
  text-align: center;
  margin-bottom: 20px;
`;

const VideoWrapper = styled.div`
  width: 950px;
  height: 800px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #ffffff;
  border-radius: 10px;
  overflow: hidden;
  background-color: #000;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const FeedbackMessage = styled.p`
  color: #ffffff;
  margin-top: 20px;
  font-size: 1.2rem;
  text-align: center;
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

const MockInterviewSession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedUniversity, numQuestions } = location.state || {};  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [phase, setPhase] = useState('read'); 
  const [timer, setTimer] = useState(10);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const [feedback, setFeedback] = useState('');

  const universityQuestions = {
    'University of Waterloo': [
      'Why are you interested in pursuing your studies at the University of Waterloo?',
      'Can you describe a time when you applied innovative thinking to solve a problem?',
      'What do you know about the co-op programs at Waterloo, and how do you think they will benefit your career?',
      'How have you demonstrated your ability to manage time effectively in a challenging academic environment?',
      'What is your approach to balancing academic rigor with extracurricular activities?'
    ],
    'University of Toronto': [
      'Why do you want to study at the University of Toronto, and how do you see yourself contributing to the campus community?',
      'Describe a significant challenge you faced during your studies and how you overcame it.',
      'How do you approach learning new concepts, and how do you adapt to difficult subjects?',
      'What excites you the most about the research opportunities available at U of T?',
      'How do you balance academics with your personal interests and hobbies?'
    ],
    'McMaster University': [
      'What attracted you to McMaster University, and what do you hope to gain from your experience here?',
      'Can you talk about a time when you had to collaborate with others to achieve a common goal?',
      'How do you handle setbacks or failures, especially in an academic context?',
      'What are your long-term career aspirations, and how does McMaster fit into your plans?',
      'What unique qualities do you bring to our program?'
    ],
    'Queen\'s University': [
      'Why have you chosen Queen\'s University for your studies, and what aspects of the university appeal to you the most?',
      'Describe a situation where you had to lead a team or project. What did you learn from that experience?',
      'What do you think are the most pressing issues facing the world today, and how do you hope to address them in your career?',
      'How do you maintain your motivation during periods of intense workload or stress?',
      'What perspective or experience do you bring that will enrich the Queen\'s community?'
    ],
    'Toronto Metropolitan University': [
      'What drew you to Toronto Metropolitan University, and what do you hope to achieve during your time here?',
      'Tell us about a project or initiative you led that you are particularly proud of.',
      'How do you handle constructive criticism, and how has it helped you improve?',
      'What steps do you take to ensure you are on track with your academic and personal goals?',
      'How do you envision your education at TMU impacting your future career?'
    ],
    'York University': [
      'Why did you choose York University for your academic journey?',
      'Describe a leadership role you have taken on and how it has influenced your development.',
      'What are your thoughts on the importance of diversity and inclusion in education?',
      'How do you approach conflict resolution, particularly in team settings?',
      'What drives you to excel in your studies, and how do you maintain your focus?'
    ],
    'Guelph University': [
      'What motivated you to apply to Guelph University, and what do you hope to gain from your experience here?',
      'How do you manage multiple priorities, especially when they are competing for your time?',
      'Describe an instance when you had to think creatively to solve a problem.',
      'What are your key strengths, and how will they help you succeed in your studies at Guelph?',
      'How do you contribute to creating a positive and collaborative learning environment?'
    ]
  };

  const questions = universityQuestions[selectedUniversity]?.slice(0, numQuestions);

  useEffect(() => {
    let countdown;

    if (phase === 'read' && timer > 0) {
      countdown = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (phase === 'read' && timer === 0) {
      setPhase('blank');
      setTimer(2);
    } else if (phase === 'blank' && timer > 0) {
      countdown = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (phase === 'blank' && timer === 0) {
      setPhase('record');
      setTimer(60);
      startRecording();
    } else if (phase === 'record' && timer > 0) {
      countdown = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (phase === 'record' && timer === 0) {
      stopRecording();
    }

    return () => clearTimeout(countdown);
  }, [timer, phase]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = stream;

    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: 'video/webm',
    });

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
      const question = questions[currentQuestionIndex];
      uploadRecording(blob, question);
      recordedChunks.current = []; 
    };
  };

  const uploadRecording = async (blob, question) => {
    setFeedback("Loading feedback..."); 
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');
    formData.append('question', question);

    try {
        const response = await fetch('http://localhost:5000/analyze', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        setFeedback(result.feedback);
    } catch (error) {
        console.error('Error uploading and processing audio:', error);
        setFeedback("Error loading feedback. Please try again.");
    }
};

const stopPlayback = async () => {
  try {
      await fetch('http://localhost:5000/stop_playback', {
          method: 'POST',
      });
  } catch (error) {
      console.error('Error stopping playback:', error);
  }
};

const handleNextQuestion = async () => {
  await stopPlayback();  
  setFeedback('');  
  if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setPhase('read');
      setTimer(10);
  } else {
      handleAllQuestionsAnswered();
  }
};

const handleAllQuestionsAnswered = async () => {
  await stopPlayback();  
  console.log("All questions answered and processed.");
  navigate('/dashboard');  
};

  return (
    <Container>
      {phase === 'read' && <QuestionPrompt>{questions[currentQuestionIndex]}</QuestionPrompt>}
      {phase === 'blank' && <QuestionPrompt>The screen will go blank. Get ready!</QuestionPrompt>}
      {phase === 'record' && (
        <>
          <QuestionPrompt>Recording... {timer} seconds remaining</QuestionPrompt>
          <VideoWrapper>
            <Video ref={videoRef} autoPlay muted></Video>
          </VideoWrapper>
        </>
      )}
      {feedback && (
        <>
          <FeedbackMessage>{feedback}</FeedbackMessage>
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
          </Button>
        </>
      )}
    </Container>
  );
};

export default MockInterviewSession;
