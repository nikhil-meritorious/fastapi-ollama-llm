'use client';

import { useEffect, useRef, useState } from 'react';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;

    if (!isChatStarted) setIsChatStarted(true);

    const userMessage: Message = { sender: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const aiIndex = messages.length + 1;
    setMessages(prev => [...prev, { sender: 'ai', text: '' }]);

    await handleStream(prompt, aiIndex);
  };

  const handleStream = async (prompt: string, aiIndex: number) => {
    setLoading(true);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3:8b',
        prompt,
        stream: true,
      }),
    });

    if (!response.body) {
      console.error('No response body');
      setLoading(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      setMessages(prev => {
        const updated = [...prev];
        updated[aiIndex] = {
          ...updated[aiIndex],
          text: updated[aiIndex].text + chunk,
        };
        return updated;
      });
    }

    setLoading(false);
  };

  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return <span key={idx}>{part}</span>;
    });
  }


  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!isChatStarted ? (
          <div className="h-full flex items-center justify-center w-full">
            <form onSubmit={handleSubmit} className="w-full max-w-xl">
              <p className="text-3xl text-center pb-4">What can I help with?</p>
              <input
                className="w-full p-4 text-xl border-gray-600 rounded-3xl shadow"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </form>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
              >
                <div
                  className={`whitespace-pre-wrap px-4 py-2 ${msg.sender === 'user'
                    ? 'bg-gray-700 text-white max-w-md rounded-3xl shadow'
                    : 'text-gray-100 w-full'
                    }`}
                >
                  {parseBold(msg.text)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-sm text-gray-400 italic">Assistant is typing...</div>
            )}
          </>
        )}
      </div>

      {isChatStarted && (
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
          <input
            className="w-full p-3 border border-gray-700 rounded-3xl shadow"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
        </form>
      )}
      <div ref={bottomRef} />
    </div>
  );

}
