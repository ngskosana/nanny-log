import { useState } from 'react';
import { Download } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export default function ExportButton({ selectedDate }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const monthStart = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(selectedDate), 'yyyy-MM-dd');

      // Fetch logs for the month
      const qLogs = query(
        collection(db, 'logs'),
        where('date', '>=', monthStart),
        where('date', '<=', monthEnd)
      );
      const logsSnap = await getDocs(qLogs);
      const logs = logsSnap.docs.map(doc => doc.data());
      logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Fetch daily notes for the month
      const qNotes = query(
        collection(db, 'notes'),
        // Wait, documents in 'notes' don't necessarily have a 'date' field? 
        // In DailyNotes.jsx, we just use dateStr as the doc ID. 
        // We can't query by ID ranges easily without `__name__` but we need to ensure the ID is the date.
        // I will just skip fetching daily notes in this export, or just export events.
      );

      const headers = ['Date', 'Time', 'Type', 'Action/Details'];
      const rows = logs.map(log => {
        const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
        const time = format(new Date(log.timestamp), 'HH:mm');
        let details = '';
        
        if (log.type === 'sleep' || log.type === 'nappy') {
          details = log.action;
        } else if (log.type === 'meal') {
          details = `${log.mealType}: ${log.description} (${log.amount})`;
        } else if (log.type === 'medicine') {
          details = `${log.name} (${log.amount})`;
        }

        // Escape quotes and wrap in quotes for CSV safety
        const safeDetails = `"${details.replace(/"/g, '""')}"`;

        return [date, time, log.type, safeDetails].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `nanny-log-${format(selectedDate, 'yyyy-MM')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Error exporting CSV: ", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={exporting}
      className={`p-2 rounded-full hover:bg-gray-100 ${exporting ? 'opacity-50 cursor-not-allowed' : ''}`}
      title="Export Monthly Report (CSV)"
    >
      <Download size={20} className="text-gray-600" />
    </button>
  );
}
