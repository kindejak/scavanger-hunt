'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} min ${seconds} sec`;
}

export default function FinishPage() {
  const router = useRouter();
  const [duration, setDuration] = useState('');

  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTasks') || '[]');
    const startTime = parseInt(localStorage.getItem('startTime') || '0');
    const endTime = Date.now();

    if (completed.length < 3 || !startTime) {
      router.push('/');
      return;
    }

    localStorage.setItem('endTime', endTime.toString());
    const totalTime = endTime - startTime;
    setDuration(formatDuration(totalTime));
  }, []);

  return (
    <main className="p-6 text-center">
    <div className="bg-white p-4 rounded shadow">
      <h1 className="text-3xl font-bold mb-4">🎉 Jste v cíli!</h1>
      <p className="text-l mb-4">A teď už do kavárny Nový Svět</p>
      <p className="text-l mb-4">Jsme všichni moc rádi, že tě můžeme vidět zase po dlouhé době Sylvie🫶! Opožděně všechno nej k narozeninám 🎂!</p>
      <p className="text-xl mb-4">Jak dlouho to trvalo:</p>
      <p className="text-2xl font-mono text-green-700">{duration}</p>
      <button
        onClick={() => {
          localStorage.clear();
          router.push('/');
        }}
        className="mt-6 px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
      >
        Začít od začátku
      </button>
    </div>
    </main>
  );
}
