import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MessageSquare } from 'lucide-react';

const MOODS = [
  { id: 'angry', emoji: '😠', label: 'Angry' },
  { id: 'sad', emoji: '☹️', label: 'Sad' },
  { id: 'okay', emoji: '😐', label: 'Okay' },
  { id: 'happy', emoji: '🙂', label: 'Happy' },
  { id: 'great', emoji: '😀', label: 'Great' }
];

export default function DailyNotes({ dateStr }) {
  const [morningNote, setMorningNote] = useState('');
  const [eveningNote, setEveningNote] = useState('');
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(doc(db, 'notes', dateStr), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMorningNote(data.morning || '');
        setEveningNote(data.evening || '');
        setMood(data.mood || null);
      } else {
        setMorningNote('');
        setEveningNote('');
        setMood(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dateStr]);

  const updateNotes = async (field, value) => {
    try {
      await setDoc(doc(db, 'notes', dateStr), {
        [field]: value
      }, { merge: true });
    } catch (e) {
      console.error("Error updating note: ", e);
    }
  };

  const handleMoodSelect = (moodId) => {
    setMood(moodId);
    updateNotes('mood', moodId);
  };

  return (
    <div className="bg-white rounded-2xl border p-4 space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="text-gray-400" />
        <h3 className="font-semibold text-gray-700">Daily Notes</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Morning Instructions</label>
        <textarea
          value={morningNote}
          onChange={(e) => setMorningNote(e.target.value)}
          onBlur={() => updateNotes('morning', morningNote)}
          placeholder="e.g., Needs medicine at 11am"
          className="w-full p-3 bg-gray-50 border rounded-xl min-h-[80px]"
          disabled={loading}
        />
      </div>

      <div className="border-t pt-4">
        <label className="block text-base font-semibold text-gray-700 mb-1">How are you feeling?</label>
        <p className="text-sm text-gray-500 mb-4">Pick the emoji that best captures your mood.</p>
        
        <div className="flex justify-between items-end mb-6">
          {MOODS.map((m) => (
            <div key={m.id} className="flex flex-col items-center gap-2">
              <button
                onClick={() => handleMoodSelect(m.id)}
                disabled={loading}
                className={`text-4xl transition-transform ${
                  mood === m.id 
                    ? 'bg-blue-600 rounded-2xl p-2 shadow-md transform scale-110' 
                    : 'p-2 hover:bg-gray-100 rounded-2xl grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                }`}
              >
                {m.emoji}
              </button>
              <span className={`text-xs font-semibold ${mood === m.id ? 'text-blue-600' : 'text-gray-500'}`}>
                {m.label}
              </span>
            </div>
          ))}
        </div>

        <label className="block text-sm font-medium text-gray-600 mb-2">Additional Details</label>
        <textarea
          value={eveningNote}
          onChange={(e) => setEveningNote(e.target.value)}
          onBlur={() => updateNotes('evening', eveningNote)}
          placeholder="Add more details about the mood or day..."
          className="w-full p-3 bg-gray-50 border rounded-xl min-h-[80px]"
          disabled={loading}
        />
      </div>
    </div>
  );
}
