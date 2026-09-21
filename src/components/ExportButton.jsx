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
      
      logs.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeA - timeB;
      });

      const headers = ['Date', 'Time', 'Type', 'Action/Details'];
      const rows = logs.map(log => {
        if (!log.timestamp) return null;
        
        try {
          const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
          const time = format(new Date(log.timestamp), 'HH:mm');
          let details = '';
          
          if (log.type === 'sleep' || log.type === 'nappy') {
            details = log.action || '';
          } else if (log.type === 'meal') {
            details = `${log.mealType || ''}: ${log.description || ''} (${log.amount || ''})`;
          } else if (log.type === 'medicine') {
            details = `${log.name || ''} (${log.amount || ''})`;
          }

          // Escape quotes and wrap in quotes for CSV safety
          const safeDetails = `"${details.replace(/"/g, '""')}"`;

          return [date, time, log.type || '', safeDetails].join(',');
        } catch (e) {
          console.warn("Skipping malformed log", log);
          return null;
        }
      }).filter(Boolean);

      const csvContent = [headers.join(','), ...rows].join('\n');
      const fileName = `nanny-log-${format(selectedDate, 'yyyy-MM')}.csv`;
      
      const file = new File([csvContent], fileName, { type: 'text/csv' });

      // Check if native mobile sharing is supported (iOS/Android)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Monthly Nanny Log',
          text: `Nanny log export for ${format(selectedDate, 'MMMM yyyy')}`
        });
      } else {
        // Fallback for desktop browsers
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

    } catch (error) {
      console.error("Error exporting CSV: ", error);
      alert("Failed to export data: " + error.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={exporting}
      className={`p-2 rounded-full hover:bg-gray-100 ${exporting ? 'opacity-50 animate-pulse cursor-wait' : ''}`}
      title="Export Monthly Report (CSV)"
    >
      <Download size={20} className="text-gray-600" />
    </button>
  );
}
