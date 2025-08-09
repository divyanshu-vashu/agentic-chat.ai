'use client';


export interface FormData {
  name: string;
  email: string;
  linkedinProfile: string;
  idea: string;
  timestamp?: string;
}

const FORM_DATA_KEY = 'ai_agent_form_data';
const SUBMISSIONS_KEY = 'ai_agent_submissions';

const SUBMIT_API_ENDPOINT = '/api/submit';

/**
 * Save form data to local storage
 * @param data Form data to save
 */
export const saveFormData = (data: FormData): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(FORM_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving form data to local storage:', error);
    }
  }
};

/**
 * Save form submission to submissions array
 * @param data 
 */
export const saveSubmission = async (data: FormData): Promise<void> => {
  try {
    // Send the form data to the API endpoint
    const response = await fetch(SUBMIT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    if (typeof window !== 'undefined') {
      try {

        const existingSubmissions = getSubmissions();
        
        const newSubmission = {
          ...data,
          timestamp: new Date().toISOString()
        };
        
        existingSubmissions.push(newSubmission);
        localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(existingSubmissions));
      } catch (error) {
        console.error('Error saving submission to local storage:', error);
      }
    }
  } catch (error) {
    console.error('Error saving submission to API:', error);
    
    if (typeof window !== 'undefined') {
      try {
        const existingSubmissions = getSubmissions();
        
        const newSubmission = {
          ...data,
          timestamp: new Date().toISOString()
        };
        
        existingSubmissions.push(newSubmission);
        localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(existingSubmissions));
      } catch (storageError) {
        console.error('Error saving submission to local storage:', storageError);
      }
    }
  }
};

/**
 * Get all form submissions
 * @returns Array of form submissions
 */
export const getSubmissions = (): Array<FormData & { timestamp?: string }> => {
  if (typeof window !== 'undefined') {
    try {
      const submissions = localStorage.getItem(SUBMISSIONS_KEY);
      return submissions ? JSON.parse(submissions) : [];
    } catch (error) {
      console.error('Error getting submissions from local storage:', error);
      return [];
    }
  }
  return [];
};

/**
 * Load form data from local storage
 * @returns Saved form data or null if not found
 */
export const loadFormData = (): FormData | null => {
  if (typeof window !== 'undefined') {
    try {
      const savedData = localStorage.getItem(FORM_DATA_KEY);
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      console.error('Error loading form data from local storage:', error);
      return null;
    }
  }
  return null;
};

/**
 * Clear form data from local storage
 */
export const clearFormData = (): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(FORM_DATA_KEY);
    } catch (error) {
      console.error('Error clearing form data from local storage:', error);
    }
  }
};

/**
 * Update a specific field in the form data
 * @param field Field name to update
 * @param value New value for the field
 */
export const updateFormField = (field: keyof FormData, value: string): void => {
  if (typeof window !== 'undefined') {
    try {
      const currentData = loadFormData() || {
        name: '',
        email: '',
        linkedinProfile: '',
        idea: ''
      };
      
      const updatedData = {
        ...currentData,
        [field]: value
      };
      
      saveFormData(updatedData);
    } catch (error) {
      console.error(`Error updating ${field} in form data:`, error);
    }
  }
};

