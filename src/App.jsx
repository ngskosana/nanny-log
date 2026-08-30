import { useState, useEffect } from 'react';
import { format, subDays, addDays, isToday, parseISO } from 'date-fns';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

import SummaryDashboard from './components/SummaryDashboard';
import LogButtons from './components/LogButtons';
import Timeline from './components/Timeline';
import DailyNotes from './components/DailyNotes';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'logs'),
      where('date', '==', dateStr),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching logs: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dateStr]);

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => {
    if (!isToday(selectedDate)) {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      {/* Header & Date Navigation */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={handlePrevDay}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-lg flex items-center gap-2">
              <Calendar size={18} />
              {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
            </h1>
          </div>

          <button 
            onClick={handleNextDay}
            disabled={isToday(selectedDate)}
            className={`p-2 rounded-full ${isToday(selectedDate) ? 'opacity-30' : 'hover:bg-gray-100'}`}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <SummaryDashboard logs={logs} />
        
        <LogButtons dateStr={dateStr} />

        <Timeline logs={logs} />

        <DailyNotes dateStr={dateStr} />
      </main>
    </div>
  );
}

export default App;
