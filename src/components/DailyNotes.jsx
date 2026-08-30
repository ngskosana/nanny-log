import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MessageSquare } from 'lucide-react';

export default function DailyNotes({ dateStr }) {
  const [morningNote, setMorningNote] = useState('');
  const [eveningNote, setEveningNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(doc(db, 'notes', dateStr), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMorningNote(data.morning || '');
        setEveningNote(data.evening || '');
      } else {
        setMorningNote('');
        setEveningNote('');
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

  return (
    <div className="bg-white rounded-2xl border p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="text-gray-400" />
        <h3 className="font-semibold text-gray-700">Daily Notes</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Morning Instructions</label>
        <textarea
          value={morningNote}
          onChange={(e) => setMorningNote(e.target.value)}
          onBlur={() => updateNotes('morning', morningNote)}
          placeholder="e.g., Needs medicine at 11am"
          className="w-full p-3 bg-gray-50 border rounded-xl min-h-[80px]"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">End of Day Update</label>
        <textarea
          value={eveningNote}
          onChange={(e) => setEveningNote(e.target.value)}
          onBlur={() => updateNotes('evening', eveningNote)}
          placeholder="e.g., Great mood today!"
          className="w-full p-3 bg-gray-50 border rounded-xl min-h-[80px]"
          disabled={loading}
        />
      </div>
    </div>
  );
}
