import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: rgba(50, 50, 50, 0.7);
  border-radius: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #3b4ce2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const AddScholarshipForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    deadline: '',
    eligibility: '',
    tags: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/admin/add_scholarship', formData);
      alert('Scholarship added successfully!');
      setFormData({ title: '', description: '', amount: '', deadline: '', eligibility: '', tags: '' });
    } catch (error) {
      console.error('Error adding scholarship:', error);
      alert('Failed to add scholarship. Please try again.');
    }
  };

  return (
    <FormContainer>
      <h2>Add New Scholarship</h2>
      <form onSubmit={handleSubmit}>
        <Input name="title" value={formData.title} onChange={handleChange} placeholder="Scholarship Title" required />
        <TextArea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
        <Input name="amount" type="number" value={formData.amount} onChange={handleChange} placeholder="Amount" required />
        <Input name="deadline" type="date" value={formData.deadline} onChange={handleChange} required />
        <TextArea name="eligibility" value={formData.eligibility} onChange={handleChange} placeholder="Eligibility Criteria" required />
        <Input name="tags" value={formData.tags} onChange={handleChange} placeholder="Tags (comma-separated)" required />
        <Button type="submit">Add Scholarship</Button>
      </form>
    </FormContainer>
  );
};

export default AddScholarshipForm;