import { useMemo } from 'react';
import { differenceInMinutes, parseISO, format } from 'date-fns';
import { Moon, Baby, Utensils } from 'lucide-react';

export default function SummaryDashboard({ logs }) {
  const summary = useMemo(() => {
    let totalSleepMins = 0;
    let sleepState = 'Awake';
    let wetCount = 0;
    let dirtyCount = 0;
    let pottyCount = 0;
    let lastMeal = null;

    // Logs are descending (newest first)
    const sleepLogs = logs.filter(l => l.type === 'sleep').sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp) // sort ascending for calculation
    );

    if (sleepLogs.length > 0) {
      const lastSleepLog = sleepLogs[sleepLogs.length - 1];
      sleepState = lastSleepLog.action === 'asleep' ? 'Asleep' : 'Awake';
      
      let currentSleepStart = null;
      for (const log of sleepLogs) {
        if (log.action === 'asleep') {
          currentSleepStart = parseISO(log.timestamp);
        } else if (log.action === 'awake' && currentSleepStart) {
          totalSleepMins += differenceInMinutes(parseISO(log.timestamp), currentSleepStart);
          currentSleepStart = null;
        }
      }
      // If currently asleep, add time from asleep until now (if it's today)
      if (sleepState === 'Asleep' && currentSleepStart) {
        totalSleepMins += differenceInMinutes(new Date(), currentSleepStart);
      }
    }

    logs.forEach(log => {
      if (log.type === 'nappy') {
        if (log.action === 'Wet') wetCount++;
        if (log.action === 'Dirty') dirtyCount++;
        if (log.action === 'Both') { wetCount++; dirtyCount++; }
        if (log.action === 'Potty Attempt') pottyCount++;
      }
      if (log.type === 'meal' && !lastMeal) {
        lastMeal = log;
      }
    });

    const sleepHours = Math.floor(totalSleepMins / 60);
    const sleepMins = totalSleepMins % 60;
    const targetExceeded = totalSleepMins > 90;

    return {
      sleepStr: `${sleepHours}h ${sleepMins}m`,
      sleepState,
      targetExceeded,
      wetCount,
      dirtyCount,
      pottyCount,
      lastMeal
    };
  }, [logs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Sleep Card */}
      <div className={`p-4 rounded-2xl border ${summary.sleepState === 'Asleep' ? 'bg-indigo-50 border-indigo-200' : 'bg-white'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Moon className={summary.sleepState === 'Asleep' ? 'text-indigo-500' : 'text-gray-400'} />
          <h3 className="font-semibold text-gray-700">Sleep</h3>
        </div>
        <p className="text-2xl font-bold">{summary.sleepStr}</p>
        <div className="flex justify-between items-end mt-2">
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            summary.sleepState === 'Asleep' ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-100 text-gray-600'
          }`}>
            {summary.sleepState}
          </span>
          {summary.targetExceeded && (
            <span className="text-xs text-red-500 font-medium">Target 1.5h exceeded!</span>
          )}
        </div>
      </div>

      {/* Nappies Card */}
      <div className="p-4 rounded-2xl border bg-white">
        <div className="flex items-center gap-2 mb-2">
          <Baby className="text-pink-500" />
          <h3 className="font-semibold text-gray-700">Nappies</h3>
        </div>
        <div className="flex gap-4 text-sm mt-4">
          <div className="text-center"><div className="text-xl font-bold">{summary.wetCount}</div><div className="text-gray-500">Wet</div></div>
          <div className="text-center"><div className="text-xl font-bold">{summary.dirtyCount}</div><div className="text-gray-500">Dirty</div></div>
          <div className="text-center"><div className="text-xl font-bold">{summary.pottyCount}</div><div className="text-gray-500">Potty</div></div>
        </div>
      </div>

      {/* Meals Card */}
      <div className="p-4 rounded-2xl border bg-white">
        <div className="flex items-center gap-2 mb-2">
          <Utensils className="text-orange-500" />
          <h3 className="font-semibold text-gray-700">Meals</h3>
        </div>
        {summary.lastMeal ? (
          <div className="mt-2">
            <p className="font-medium">{summary.lastMeal.mealType} ({format(parseISO(summary.lastMeal.timestamp), 'HH:mm')})</p>
            <p className="text-sm text-gray-600">{summary.lastMeal.amount} - {summary.lastMeal.description}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-2">No meals logged yet.</p>
        )}
      </div>
    </div>
  );
}
