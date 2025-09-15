
import React, { useState, useCallback } from 'react';
import Header from './components/Header.tsx';
import StyleButton from './components/StyleButton.tsx';
import Spinner from './components/Spinner.tsx';

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

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('A dynamic and modern logo for a channel named "kaar", featuring a stylized letter K. High resolution, suitable for branding.');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateLogo = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await fetch('/.netlify/functions/generateLogo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'An error occurred while generating the logo.');
      }
      
      setGeneratedImage(`data:image/png;base64,${result.imageB64}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const addStyleToPrompt = (style: string) => {
    setPrompt(prev => `${prev.replace(/, [A-Za-z]+ style\.$/, '')}, ${style.toLowerCase()} style.`);
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'kaar-logo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

              <button
                onClick={handleGenerateLogo}
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg"
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    Generating...
                  </>
                ) : (
                  '✨ Generate Super Logo'
                )}
              </button>
            </div>

            {/* Right Side: Display */}
            <div className="lg:w-1/2 flex flex-col items-center justify-center bg-gray-900 p-6 rounded-lg border border-dashed border-gray-600 min-h-[300px]">
              {isLoading && (
                 <div className="text-center" role="status" aria-live="polite">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Conjuring up your masterpiece...</p>
                 </div>
              )}
              {error && (
                <div className="text-center text-red-400" role="alert">
                  <p><strong>Oops! Something went wrong.</strong></p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {generatedImage && !isLoading && (
                <div className="flex flex-col items-center gap-4">
                   <h3 className="text-lg font-semibold text-indigo-300">Your Logo is Ready!</h3>
                  <img src={generatedImage} alt="Generated logo for kaar" className="rounded-lg shadow-2xl max-w-full h-auto" />
                   <button
                    onClick={downloadImage}
                    className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download
                  </button>
                </div>
              )}
              {!isLoading && !generatedImage && !error && (
                 <div className="text-center text-gray-500">
                    <p>Your generated logo will appear here.</p>
                    <p className="text-xs mt-2">Just describe your ideal logo and click generate!</p>
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
