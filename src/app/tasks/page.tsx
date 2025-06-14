'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TASKS } from '@/lib/tasks';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function TasksPage() {
  const router = useRouter();
  const [taskIndex, setTaskIndex] = useState(0);
  const [photo, setPhoto] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');
  const [locationOk, setLocationOk] = useState(false);
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const task = TASKS[taskIndex];

  useEffect(() => {
    const started = localStorage.getItem('huntStarted');
    const startTime = localStorage.getItem('startTime');
    const completed = JSON.parse(localStorage.getItem('completedTasks') || '[]');

    if (!started || !startTime) {
      router.push('/');
      return;
    }

    if (completed.length >= TASKS.length) {
      router.push('/finish');
      return;
    }

    setTaskIndex(completed.length);
  }, []);

  const handleLocationCheck = () => {
    if (!task.location) return;

    setCheckingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const dist = haversineDistance(
          position.coords.latitude,
          position.coords.longitude,
          task.location!.lat,
          task.location!.lng
        );
        if (dist < 100) {
          setLocationOk(true);
        } else {
          setError(`Jsi moc daleko, a to: ${Math.round(dist)}m`);
        }
        setCheckingLocation(false);
      },
      () => {
        setError('Mám problém s přístupem k poloze');
        setCheckingLocation(false);
      }
    );
  };

  const handlePhotoUpload = async () => {
    if (!photo) {
      setError('Please select a photo first');
      return false;
    }

    setUploading(true);
    setError('');
    setPhotoUploaded(false);

    try {
      const formData = new FormData();
      formData.append('file', photo);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Upload failed');
        setUploading(false);
        return false;
      }

      setPhotoUploaded(true);
      setUploading(false);
      return true;
    } catch (e) {
      setError('Upload error');
      setUploading(false);
      return false;
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    if (
      (task.type.includes('location') && !locationOk) ||
      (task.type.includes('photo') && !photoUploaded) ||
      (task.type.includes('text') &&
        task.correctAnswer?.toLowerCase().trim() !== textAnswer.toLowerCase().trim())
    ) {
      setError('Please complete all requirements correctly.');
      return;
    }

    // Mark task as completed
    const completed = JSON.parse(localStorage.getItem('completedTasks') || '[]');
    completed.push(task.id);
    localStorage.setItem('completedTasks', JSON.stringify(completed));

    if (completed.length >= TASKS.length) {
      router.push('/finish');
    } else {
      setPhoto(null);
      setPhotoUploaded(false);
      setTextAnswer('');
      setLocationOk(false);
      setError('');
      setSuccess(false);
      setTaskIndex((prev) => prev + 1);
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Úkol {taskIndex + 1} z {TASKS.length}</h1>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold">{task.title}</h2>
        <p className="text-gray-600 mb-4">{task.description}</p>

        {task.type.includes('location') && (
          <div className="mb-4">
            <p className="mb-2">📍 Kontrola místa </p>
            {locationOk ? (
              <p className="text-green-600">✅ Jste na správné adrese!</p>
            ) : (
              <button
                onClick={handleLocationCheck}
                className="px-4 py-2 bg-blue-500 text-white rounded"
                disabled={checkingLocation}
              >
                {checkingLocation ? 'Kontroluji...' : 'Zkontrolovat místo'}
              </button>
            )}
          </div>
        )}

        {task.type.includes('photo') && (
          <div className="mb-4">
            <p className="mb-2">📸 Nahrát fotku</p>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                setPhoto(e.target.files?.[0] || null);
                setPhotoUploaded(false);
                setError('');
              }}
            />
            <button
              onClick={handlePhotoUpload}
              disabled={!photo || uploading || photoUploaded}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              {uploading ? 'Nahrávám...' : photoUploaded ? 'Nahráno' : 'Nahrát fotku'}
            </button>
            {error && <p className="text-red-600 mt-1">{error}</p>}
            {photoUploaded && <p className="text-green-600 mt-1">✅ Fotka je nahraná</p>}
          </div>
        )}

        {task.type.includes('text') && (
          <div className="mb-4">
            <p className="mb-2">✍️ Odpověz!</p>
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Tvá odpověď"
            />
          </div>
        )}

        {error && <p className="text-red-600 mt-2">{error}</p>}
        {success && <p className="text-green-700 mt-2">✅ Úkol dokončen!</p>}

        <button
          onClick={handleSubmit}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Odeslat
        </button>
      </div>
    </main>
  );
}
