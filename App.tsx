
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header.tsx';
import StyleButton from './components/StyleButton.tsx';
import Spinner from './components/Spinner.tsx';
import { generateLogoConcept } from './services/geminiService.ts';

const LOGO_STYLES = [
  "Minimalist",
  "Neon",
  "Vintage",
  "Futuristic",
  "3D",
  "Abstract",
  "Vector",
  "Graffiti"
];

const DAILY_LIMIT = 5;

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeySubmitted, setIsKeySubmitted] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>('A dynamic and modern logo for a channel named "kaar", featuring a stylized letter K.');
  const [generatedConcept, setGeneratedConcept] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState<number>(0);

  // Load usage count from localStorage on initial render
  useEffect(() => {
    try {
      const storedUsage = localStorage.getItem('logoConceptUsage');
      if (storedUsage) {
        const { date, count } = JSON.parse(storedUsage);
        const today = new Date().toISOString().split('T')[0];
        if (date === today) {
          setUsageCount(count);
        } else {
          // Reset for a new day
          localStorage.removeItem('logoConceptUsage');
        }
      }
    } catch (e) {
      console.error("Failed to parse usage data from localStorage", e);
      localStorage.removeItem('logoConceptUsage');
    }
  }, []);

  const checkAndRecordUsage = (): boolean => {
    const today = new Date().toISOString().split('T')[0];
    let currentCount = 0;
    
    try {
        const storedUsage = localStorage.getItem('logoConceptUsage');
        if (storedUsage) {
            const { date, count } = JSON.parse(storedUsage);
            if (date === today) {
                currentCount = count;
            }
        }
    } catch(e) {
        console.error("Failed to parse usage data, resetting.", e);
        currentCount = 0;
    }

    if (currentCount >= DAILY_LIMIT) {
      setError(`You have reached your daily limit of ${DAILY_LIMIT} logo concepts.`);
      return false;
    }

    const newCount = currentCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('logoConceptUsage', JSON.stringify({ date: today, count: newCount }));
    return true;
  };

  const handleGenerateConcept = useCallback(async () => {
    if (!apiKey) {
      setError("API Key is missing. Please refresh and enter your API key.");
      return;
    }
    if (!checkAndRecordUsage()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedConcept(null);

    try {
      const conceptText = await generateLogoConcept(prompt, apiKey);
      setGeneratedConcept(conceptText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
      // Revert usage count on failure
      const today = new Date().toISOString().split('T')[0];
      const newCount = usageCount; // It was already incremented, so this is the failed attempt
      setUsageCount(newCount - 1);
      localStorage.setItem('logoConceptUsage', JSON.stringify({ date: today, count: newCount - 1 }));

    } finally {
      setIsLoading(false);
    }
  }, [prompt, apiKey, usageCount]);

  const addStyleToPrompt = (style: string) => {
    setPrompt(prev => `${prev.split(',').slice(0, 2).join(',')}, in a ${style.toLowerCase()} style.`);
  };
  
  const copyToClipboard = () => {
    if (!generatedConcept) return;
    navigator.clipboard.writeText(generatedConcept)
      .then(() => {
         alert('Concept copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy concept.');
      });
  };

  if (!isKeySubmitted) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md mx-auto bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700 text-center">
          <Header />
          <div className="mt-8">
            <label htmlFor="apiKey" className="block text-sm font-medium text-indigo-300 mb-2">
              Enter Your Gemini API Key
            </label>
            <input
              id="apiKey"
              type="password"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 placeholder-gray-500"
              placeholder="***************************************"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              aria-label="Gemini API Key"
            />
            <p className="text-xs text-gray-500 mt-2">
              Your key is used only for this session. A billed account is not required for concept generation.
            </p>
            <button
              onClick={() => {
                if (apiKey.trim()) {
                  setIsKeySubmitted(true);
                }
              }}
              disabled={!apiKey.trim()}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Generating
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <Header />

        <main className="mt-6 bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side: Controls */}
            <div className="lg:w-1/2 flex flex-col space-y-6">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-indigo-300 mb-2">
                  1. Describe your logo
                </label>
                <textarea
                  id="prompt"
                  rows={4}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 placeholder-gray-500"
                  placeholder="e.g., A minimalist logo for 'kaar'..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  aria-label="Logo description prompt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo-300 mb-2">
                  2. Add a style (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {LOGO_STYLES.map(style => (
                    <StyleButton key={style} label={style} onClick={() => addStyleToPrompt(style)} />
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-center text-gray-400">
                Daily generations remaining: {Math.max(0, DAILY_LIMIT - usageCount)}
              </p>

              <button
                onClick={handleGenerateConcept}
                disabled={isLoading || usageCount >= DAILY_LIMIT}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg"
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    Brainstorming...
                  </>
                ) : (
                  '✨ Generate Logo Concept'
                )}
              </button>
            </div>

            {/* Right Side: Display */}
            <div className="lg:w-1/2 flex flex-col items-center justify-center bg-gray-900 p-6 rounded-lg border border-dashed border-gray-600 min-h-[300px]">
              {isLoading && (
                 <div className="text-center" role="status" aria-live="polite">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Brainstorming your concept...</p>
                 </div>
              )}
              {error && (
                <div className="text-center text-red-400" role="alert">
                  <p><strong>Oops! Something went wrong.</strong></p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {generatedConcept && !isLoading && (
                <div className="flex flex-col items-center gap-4 w-full text-left">
                   <h3 className="text-lg font-semibold text-indigo-300 self-start">Your Logo Concept:</h3>
                   <div className="w-full h-64 overflow-y-auto bg-gray-800 p-4 rounded-md text-gray-300 text-sm whitespace-pre-wrap">
                      {generatedConcept}
                   </div>
                   <button
                    onClick={copyToClipboard}
                    className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM5 11a1 1 0 100 2h4a1 1 0 100-2H5z"/>
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1H4z" clipRule="evenodd"/>
                    </svg>
                    Copy Concept
                  </button>
                </div>
              )}
              {!isLoading && !generatedConcept && !error && (
                 <div className="text-center text-gray-500">
                    <p>Your logo concept will appear here.</p>
                    <p className="text-xs mt-2">Describe your ideal logo and let AI brainstorm the details!</p>
                 </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
