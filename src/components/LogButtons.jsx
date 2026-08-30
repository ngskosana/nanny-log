import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';

export default function LogButtons({ dateStr }) {
  const [activeTab, setActiveTab] = useState('sleep');

  // Meal state
  const [mealType, setMealType] = useState('Breakfast');
  const [mealDesc, setMealDesc] = useState('');
  const [mealAmt, setMealAmt] = useState('All');

  const addLog = async (data) => {
    try {
      const now = new Date();
      await addDoc(collection(db, 'logs'), {
        ...data,
        timestamp: now.toISOString(),
        date: dateStr // allow logging for "selectedDate" but timestamp is now. Or if logging for past day, might need time picker. Simple for now: log in current time, but assigned to selected date. Wait, if dateStr is different than today, the timeline will show today's time. Let's just use current timestamp and assign to the `dateStr` so it shows up in that day's timeline.
      });
      // reset forms
      setMealDesc('');
    } catch (e) {
      console.error("Error adding log: ", e);
    }
  };

  const handleSleep = (action) => addLog({ type: 'sleep', action });
  const handleNappy = (action) => addLog({ type: 'nappy', action });
  
  const handleMeal = (e) => {
    e.preventDefault();
    if (!mealDesc) return;
    addLog({ type: 'meal', mealType, description: mealDesc, amount: mealAmt });
  };

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <div className="flex border-b">
        {['sleep', 'meal', 'nappy'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium capitalize ${
              activeTab === tab ? 'bg-gray-100 text-gray-900 border-b-2 border-indigo-500' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === 'sleep' && (
          <div className="flex gap-4">
            <button onClick={() => handleSleep('asleep')} className="flex-1 py-4 bg-indigo-100 text-indigo-700 rounded-xl font-bold active:bg-indigo-200 text-lg">
              Asleep
            </button>
            <button onClick={() => handleSleep('awake')} className="flex-1 py-4 bg-orange-100 text-orange-700 rounded-xl font-bold active:bg-orange-200 text-lg">
              Awake
            </button>
          </div>
        )}

        {activeTab === 'nappy' && (
          <div className="grid grid-cols-2 gap-3">
            {['Wet', 'Dirty', 'Both', 'Dry', 'Potty Attempt'].map(type => (
              <button
                key={type}
                onClick={() => handleNappy(type)}
                className={`py-3 rounded-xl font-semibold active:bg-pink-200 ${
                  type === 'Potty Attempt' ? 'col-span-2 bg-purple-100 text-purple-700' : 'bg-pink-50 text-pink-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'meal' && (
          <form onSubmit={handleMeal} className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['Breakfast', 'Snack', 'Lunch', 'Dinner'].map(type => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setMealType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    mealType === type ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={mealDesc}
              onChange={(e) => setMealDesc(e.target.value)}
              placeholder="What did they eat?"
              className="w-full p-3 bg-gray-50 border rounded-xl"
              required
            />

            <div className="flex gap-2 justify-between">
              {['None', 'Some', 'Most', 'All'].map(amt => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setMealAmt(amt)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    mealAmt === amt ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>

            <button type="submit" className="w-full py-3 bg-green-500 text-white font-bold rounded-xl active:bg-green-600 text-lg">
              Save Meal
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
