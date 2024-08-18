import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Login from './components/views/Login';
import Dashboard from './components/views/Dashboard';
import Layout from './components/views/Layout';
import CreateApplication from './components/views/CreateApplication';
import CompleteProfile from './components/views/CompleteProfile';
import EssayTips from './components/views/EssayTips';
import MockInterviewForm from './components/views/MockInterviewForm';
import MockInterviewSession from './components/views/MockInterviewSession';
import MockInterviewFeedback from './components/views/MockInterviewFeedback';
import Scholarships from './components/views/Scholarships';
import addScholarships from './components/views/addScholarships'
import { auth } from './firebase';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/create-application" element={user ? <CreateApplication /> : <Navigate to="/login" />} />
        <Route path="/complete-profile" element={user ? <CompleteProfile /> : <Navigate to="/login" />} />
        <Route path="/essay-tips" element={user ? <EssayTips /> : <Navigate to="/login" />} />
        <Route path="/mock-interview" element={user ? <MockInterviewForm user={user} /> : <Navigate to="/login" />} />
        <Route path="/mock-interview/session" element={user ? <MockInterviewSession user={user} /> : <Navigate to="/login" />} />
        <Route path="/mock-interview/feedback" element={user ? <MockInterviewFeedback user={user} /> : <Navigate to="/login" />} />
        <Route path="/scholarships" element={user ? <Scholarships /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
