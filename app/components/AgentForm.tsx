'use client';

import { useState, useCallback, useEffect } from 'react';
import { FormData, saveFormData, loadFormData, clearFormData, saveSubmission } from '../utils/local_storage';



type FormRefType = {
  updateFormField: (field: string, value: string) => void;
  submitForm: () => void;
};

interface AgentFormProps {
  formRef?: React.RefObject<FormRefType | null>;
}

export default function AgentForm({ formRef }: AgentFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    linkedinProfile: '',
    idea: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  
  useEffect(() => {
    const savedData = loadFormData();
    if (savedData) {
      setFormData(savedData);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value
    };
    setFormData(updatedData);
    saveFormData(updatedData);
  };
  
  
  const updateFormField = useCallback((field: string, value: string) => {
    const updatedData = {
      ...formData,
      [field]: value
    };
    setFormData(updatedData);
    saveFormData(updatedData);
  }, [formData]);
  
  
  const submitForm = useCallback(async () => {
    console.log('Form submitted:', formData);
    try {
      
      await saveSubmission(formData);
      alert('Form submitted successfully!');
      setIsSubmitted(true);
      setShowSuccess(true);
      
      clearFormData();
      
      setFormData({
        name: '',
        email: '',
        linkedinProfile: '',
        idea: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting the form. Please try again.');
    }
  }, [formData]);
  
  
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);
  
  
  if (formRef) {
    formRef.current = {
      updateFormField,
      submitForm
    };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    try {
      
      await saveSubmission(formData);
      alert('Form submitted successfully!');
      setIsSubmitted(true);
      setShowSuccess(true);
      clearFormData();
      setFormData({
        name: '',
        email: '',
        linkedinProfile: '',
        idea: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting the form. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 relative">
      {showSuccess && (
        <div className="absolute top-4 left-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Form submitted successfully!</span>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
            required
          />
        </div>

        <div>
          <label htmlFor="linkedinProfile" className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn Profile
          </label>
          <input
            type="url"
            id="linkedinProfile"
            name="linkedinProfile"
            value={formData.linkedinProfile}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/your-profile"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
            required
          />
        </div>

        <div>
          <label htmlFor="idea" className="block text-sm font-medium text-gray-700 mb-2">
            Describe your AI agent idea
          </label>
          <textarea
            id="idea"
            name="idea"
            value={formData.idea}
            onChange={handleChange}
            placeholder="Describe the AI agent you want to build..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500 resize-none"
            required
            data-testid="idea-input"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span>Submit my idea</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Or use the AI copilot on the right to help you fill out this form automatically
        </p>
      </div>
    </div>
  );
}
