# AI Agent Form

A Next.js application with a form for collecting AI agent ideas.

**Objective**: Implement an AI copilot that appears on the right side of the form and helps users fill the form.

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/80e0ae7b-415d-4de9-9e85-cfbc73e32129" />

## Current State

- ✅ Form component with name, email, LinkedIn, and idea fields
- ✅ Responsive layout with dedicated copilot space
- ✅  Implement the AI copilot component


## 🚀 Getting Started

### Install Dependencies

1. Ensure **Node.js version 22** is installed (`node --version`)
2. Navigate to project directory: `cd agent-form-app`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Open http://localhost:3000



- **Location**: Replace the copilot placeholder in `app/page.tsx`
- **Requirements**: Your copilot should:
  - Guide users through filling the form conversationally
  - Collect information step by step (name, email, LinkedIn, idea)
  - Update form fields automatically as data is collected
  - Follow the sample conversation flow above

### Key Files

- `app/page.tsx` - Main page with form and copilot placeholder
- `app/components/AgentForm.tsx` - The form component
- `app/globals.css` - Global styles (if needed)

### LLM Integration

You can use any LLM service for your copilot implementation. Some options include:

- **Gemini 2.5 Flash** from [Google AI Studio](https://aistudio.google.com/) (free to use)
- OpenAI API
- Anthropic Claude
- Groq

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- React







