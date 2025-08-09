'use client';

import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AICopilotProps {
  updateFormData: (field: string, value: string) => void;
  submitForm?: () => void;
}

export default function AICopilot({ updateFormData, submitForm }: AICopilotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  type ConversationStep = 'name' | 'email' | 'linkedin' | 'idea' | 'review';
  const [currentStep, setCurrentStep] = useState<ConversationStep>('name');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

  useEffect(() => {
    const initialMessage = {
      role: 'assistant' as const,
      content: "Hi! I'm here to help you submit your AI agent idea. Let's start with the basics - what's your name?"
    };
    setMessages([initialMessage]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const extractInformation = async (userMessage: string, step: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      let prompt = '';
      let fieldToUpdate = '';
      
      switch (step) {
        case 'name':
          prompt = `Extract ONLY the person's name from this message: "${userMessage}". 
          Return ONLY the name itself with no explanations, no quotation marks, and no additional text. 
          If you cannot determine a valid name, respond with ONLY "Unknown".`;
          fieldToUpdate = 'name';
          break;
        case 'email':
          prompt = `Extract ONLY the email address from this message: "${userMessage}". 
          Return ONLY the email address with no explanations, no quotation marks, and no additional text. 
          If you cannot determine a valid email address, respond with ONLY "Unknown".`;
          fieldToUpdate = 'email';
          break;
        case 'linkedin':
          prompt = `Extract ONLY the LinkedIn profile URL from this message: "${userMessage}". 
          Return ONLY the URL with no explanations, no quotation marks, and no additional text.
          If the URL starts with "https://" or "http://", return it as is.
          If you cannot determine a valid LinkedIn profile, respond with ONLY "Unknown".`;
          fieldToUpdate = 'linkedinProfile';
          break;
        case 'idea':
          prompt = `Extract ONLY the AI agent idea description from this message: "${userMessage}". 
          Return ONLY the description with no explanations, no quotation marks, and no additional text.
          Focus on extracting any mention of AI features, functionality, capabilities, or concepts.
          If the message describes what the AI should do or how it should work, extract that as the idea.
          If you cannot determine a valid description, respond with ONLY "Unknown".`;
          fieldToUpdate = 'idea';
          break;
        default:
          return;
      }
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      let validatedText = text;
      
      if (step === 'idea' && validatedText !== 'Unknown') {

        if (validatedText.length < 5) {
          validatedText = userMessage;
        }
      }
      

      if (text.includes("cannot") || text.includes("not") || text.includes("invalid") || 
          text.includes("explanation") || text.includes(".") || text.length > 100) {
        
        const retryPrompt = `I need ONLY the exact ${step} from "${userMessage}". 
        No explanations, no quotation marks, just the ${step} itself. 
        If there is no valid ${step}, just respond with "Unknown".`;
        
        const retryResult = await model.generateContent(retryPrompt);
        const retryResponse = await retryResult.response;
        validatedText = retryResponse.text().trim();
        
        if (validatedText.includes("cannot") || validatedText.includes("not") || 
            validatedText.includes("invalid") || validatedText.includes("explanation") || 
            validatedText.includes(".") || validatedText.length > 100) {
          if (step === 'linkedin') {
            console.log("validated text linkedin ",validatedText);
            
          } else {
            validatedText = userMessage;
          }
        }
      }
      
      if (validatedText && validatedText !== "Unknown") {
        updateFormData(fieldToUpdate, validatedText);
      }
      
      return validatedText;
    } catch (error) {
      console.error('Error extracting information:', error);
      return userMessage;
    }
  };

  const generateResponse = async (userMessage: string, step: string, extractedInfo: string | null) => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      let prompt = '';
      let nextStep = '';
      const displayInfo = extractedInfo === 'Unknown' ? userMessage : (extractedInfo || userMessage);
      
      switch (step) {
        case 'name':
          prompt = `The user has provided their name: "${displayInfo}". Respond in a friendly way, confirming you've updated their name field, and ask for their email address. Keep it brief and conversational. Include 🎯 Name field: "${displayInfo}" in your response.`;
          nextStep = 'email';
          break;
        case 'email':
          prompt = `The user has provided their email: "${displayInfo}". Respond in a friendly way, confirming you've updated their email field, and ask for their LinkedIn profile URL. Keep it brief and conversational. Include 🎯 Email field: "${displayInfo}" in your response.`;
          nextStep = 'linkedin';
          break;
        case 'linkedin':
          prompt = `The user has provided their LinkedIn profile: "${displayInfo}". Respond in a friendly way, confirming you've updated their LinkedIn field, and ask about their AI agent idea. Keep it brief and conversational. Include 🎯 LinkedIn field: "${displayInfo}" in your response.`;
          nextStep = 'idea';
          break;
        case 'idea':
          prompt = `The user has provided their AI agent idea: "${displayInfo}". Respond enthusiastically, confirming you've updated their idea field, and ask if they're ready to submit the form. Keep it brief and conversational. Include 🎯 Idea field: "${displayInfo}" in your response.`;
          nextStep = 'review';
          break;
        case 'review':
          if (userMessage.toLowerCase().includes('submit') || userMessage.toLowerCase().includes('yes')) {
            prompt = `The user wants to submit the form. Respond in a friendly way, confirming you're submitting their form now. Keep it brief and conversational.`;

            setTimeout(() => {
              if (submitForm) {
                submitForm();
              }
            }, 1000);
          } else {
            prompt = `The user is reviewing their submission. Respond in a friendly way, confirming all information has been filled out and they can submit when ready. Keep it brief and conversational.`;
          }
          nextStep = 'review';
          break;
        default:
          return '';
      }
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      setCurrentStep(nextStep as ConversationStep);
      return text;
    } catch (error) {
      console.error('Error generating response:', error);
      return 'I apologize, but I encountered an error. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {

      const extractedInfo = await extractInformation(userMessage, currentStep);
      
      const assistantResponse = await generateResponse(userMessage, currentStep, extractedInfo || null);
      
      setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
    } catch (error) {
      console.error('Error in conversation flow:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800'}`}
            >
              {message.content.split(/🎯 (.*? field: ".*?")/).map((part, i, arr) => {
                if (i % 2 === 1 && i < arr.length - 1) {
                  return (
                    <span key={i} className="font-medium text-blue-500 bg-blue-50 px-1 rounded">
                      🎯 {part}
                    </span>
                  );
                }
                return <span key={i}>{part}</span>;
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}