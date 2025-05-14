'use client';

import { useState } from 'react';

export default function Home() {
  const [promt, setPromt] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleStream = async () => {
    setMessage('');
    setLoading(true);

    const response = await fetch('http://192.168.1.13:8001/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3:8b',
        prompt: promt,
        stream: true,
      }),
    });

    if (!response.body) {
      console.error('No response body');
      setLoading(false);
      return;
    }
    
    setPromt('');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      setMessage((prev) => prev + chunk);
    }
    setLoading(false);
  };

  return (
    <div className="w-full h-[100vh] bg-white dark:bg-[#212121] p-4 relative">
      {message && (
        <div className="mt-4 p-4 border rounded bg-gray-100 dark:bg-zinc-800 borer-zinc-800 whitespace-pre-wrap">
          <p className='text-black dark:text-gray-400'>{message}</p>
        </div>
      )}
      <div
        className={`${message
            ? 'fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full p-4 bg-white dark:bg-[#212121]'
            : 'absolute top-[50%] w-[97%]'
          }`}
      >
        <div className="flex gap-4">
          <input
            className="w-[85%] bg-gray-200 rounded text-black px-4"
            type="text"
            name="prompt"
            value={promt}
            onChange={(e) => setPromt(e.target.value)}
          />
          <button
            className="w-[15%] px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleStream}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Text'}
          </button>
        </div>
      </div>
    </div>
  );
}
