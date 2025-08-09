import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { FormData } from '../../utils/local_storage';


const ensureDataDirectoryExists = () => {
  const dataDir = path.join(process.cwd(), 'app/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

export async function POST(request: NextRequest) {
  try {
    ensureDataDirectoryExists();
    
    const formData: FormData = await request.json();
    
    const submissionWithTimestamp = {
      ...formData,
      timestamp: new Date().toISOString()
    };
    
    const dataFilePath = path.join(process.cwd(), 'app/data/formData.js');
    
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, '// This file stores form submissions\nlet formData = [];\n\nexport default formData;', 'utf8');
    }
    
    try {
       
       const fileContent = fs.readFileSync(dataFilePath, 'utf8');
      
      
      const arrayStartIndex = fileContent.indexOf('let formData = ') + 'let formData = '.length;
      const arrayEndIndex = fileContent.indexOf('export default formData');
      
      
      let currentArray: FormData[] = [];
      const arrayContent = fileContent.substring(arrayStartIndex, arrayEndIndex).trim();
      
      if (arrayContent && arrayContent !== '[];') {
        
        const cleanContent = arrayContent.endsWith(';') 
          ? arrayContent.substring(0, arrayContent.length - 1) 
          : arrayContent;
        
        try {
          
          currentArray = Function('return ' + cleanContent)();
        } catch (parseError) {
          console.error('Error parsing array content:', parseError);
          
          currentArray = [];
        }
      }
      
      
      currentArray.push(submissionWithTimestamp);
      
      
      const newFileContent = `// This file stores form submissions
let formData = ${JSON.stringify(currentArray, null, 2)};

export default formData;
`;
      
      
      fs.writeFileSync(dataFilePath, newFileContent, 'utf8');
      
      console.log('Form data saved successfully to file');
      return NextResponse.json({ success: true, message: 'Form data saved successfully' });
    } catch (fileError) {
      console.error('Error processing form data file:', fileError);
      return NextResponse.json(
        { success: false, message: 'Error processing form data file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error saving form data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save form data' },
      { status: 500 }
    );
  }
}