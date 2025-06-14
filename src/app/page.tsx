'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';



const ACCESS_CODE = 'pain au chocolat';

export default function Home() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleStart = () => {
    if (code.trim().toLowerCase() === ACCESS_CODE) {
      localStorage.setItem('huntStarted', 'true');
      localStorage.setItem('startTime', Date.now().toString());
      router.push('/tasks');
    } else {
      setError('Špatný kód.');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Syvie velké dobrodružsví</h1>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Kód pro začátek hry :)"
        className="border p-2 mb-4 w-64 rounded"
      />
      <button
        onClick={handleStart}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Start
      </button>
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </main>
  );
}
