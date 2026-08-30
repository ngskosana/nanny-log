import { format, parseISO } from 'date-fns';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Moon, Baby, Utensils } from 'lucide-react';

export default function Timeline({ logs }) {
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this log?')) {
      try {
        await deleteDoc(doc(db, 'logs', id));
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'sleep': return <Moon size={16} className="text-indigo-500" />;
      case 'nappy': return <Baby size={16} className="text-pink-500" />;
      case 'meal': return <Utensils size={16} className="text-orange-500" />;
      default: return null;
    }
  };

  const formatLogText = (log) => {
    switch (log.type) {
      case 'sleep':
        return `Sleep: ${log.action}`;
      case 'nappy':
        return `Nappy: ${log.action}`;
      case 'meal':
        return `${log.mealType}: ${log.description} (${log.amount})`;
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-2xl border p-4">
      <h3 className="font-semibold text-gray-700 mb-4">Timeline</h3>
      {logs.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No events logged for this day.</p>
      ) : (
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log.id} className="flex items-start gap-4">
              <div className="text-sm text-gray-500 w-12 pt-1 font-mono">
                {format(parseISO(log.timestamp), 'HH:mm')}
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl p-3 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    {getIcon(log.type)}
                  </div>
                  <span className="font-medium text-gray-800 text-sm">
                    {formatLogText(log)}
                  </span>
                </div>
                <button 
                  onClick={() => handleDelete(log.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
