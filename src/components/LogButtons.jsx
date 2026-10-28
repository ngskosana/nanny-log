import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';

export default function LogButtons({ dateStr }) {
  const [activeTab, setActiveTab] = useState('sleep');
  const [showPottyOptions, setShowPottyOptions] = useState(false);

  // Meal state
  const [mealType, setMealType] = useState('Breakfast');
  const [mealDesc, setMealDesc] = useState('');
  const [mealAmt, setMealAmt] = useState('All');

  // Medicine state
  const [medicineName, setMedicineName] = useState('');
  const [medicineAmount, setMedicineAmount] = useState('');

  const addLog = async (data) => {
    try {
      const now = new Date();
      await addDoc(collection(db, 'logs'), {
        ...data,
        timestamp: now.toISOString(),
        date: dateStr 
      });
      // reset forms
      setMealDesc('');
      setMedicineName('');
      setMedicineAmount('');
    } catch (e) {
      console.error("Error adding log: ", e);
    }
  };

  const handleSleep = (action) => addLog({ type: 'sleep', action });
  const handleNappy = (action) => {
    addLog({ type: 'nappy', action });
    setShowPottyOptions(false);
  };
  
  const handleMeal = (e) => {
    e.preventDefault();
    if (!mealDesc) return;
    addLog({ type: 'meal', mealType, description: mealDesc, amount: mealAmt });
  };

  const handleMedicine = (e) => {
    e.preventDefault();
    if (!medicineName || !medicineAmount) return;
    addLog({ type: 'medicine', name: medicineName, amount: medicineAmount });
  };

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <div className="flex border-b overflow-x-auto">
        {['sleep', 'meal', 'nappy', 'medicine'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setShowPottyOptions(false);
            }}
            className={`flex-1 min-w-[80px] py-3 text-sm font-medium capitalize whitespace-nowrap ${
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
            {['Wet', 'Dirty', 'Both', 'Dry'].map(type => (
              <button
                key={type}
                onClick={() => handleNappy(type)}
                className="py-3 rounded-xl font-semibold bg-pink-50 text-pink-700 active:bg-pink-200"
              >
                {type}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowPottyOptions(prev => !prev)}
              aria-expanded={showPottyOptions}
              className={`col-span-2 py-3 rounded-xl font-semibold transition-colors ${
                showPottyOptions
                  ? 'bg-purple-200 text-purple-800'
                  : 'bg-purple-100 text-purple-700 active:bg-purple-200'
              }`}
            >
              Potty
            </button>

            {showPottyOptions && (
              <div className="col-span-2 grid grid-cols-2 gap-3 pt-1">
                {['Wet', 'Dirty'].map(subType => (
                  <button
                    key={`Potty (${subType})`}
                    type="button"
                    onClick={() => handleNappy(`Potty (${subType})`)}
                    className="py-3 rounded-xl font-semibold bg-purple-50 text-purple-700 border border-purple-200 active:bg-purple-200"
                  >
                    Potty ({subType})
                  </button>
                ))}
              </div>
            )}
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

        {activeTab === 'medicine' && (
          <form onSubmit={handleMedicine} className="space-y-4">
            <input
              type="text"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="Medicine (e.g., Calpol)"
              className="w-full p-3 bg-gray-50 border rounded-xl"
              required
            />
            <input
              type="text"
              value={medicineAmount}
              onChange={(e) => setMedicineAmount(e.target.value)}
              placeholder="Amount (e.g., 5ml)"
              className="w-full p-3 bg-gray-50 border rounded-xl"
              required
            />
            <button type="submit" className="w-full py-3 bg-red-500 text-white font-bold rounded-xl active:bg-red-600 text-lg">
              Save Medicine
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
