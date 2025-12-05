import { useState } from 'react';
import { 
  CheckCircle, XCircle, Clock, Zap, TrendingUp, 
  Download, Upload, Calendar, Flame, Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  groupSessionsByDate,
  calculateStatistics,
  formatDuration,
  formatTime
} from '../utils/sessionHistory';
import {
  exportData,
  importData,
  downloadFile,
  generateExportFilename
} from '../utils/storageHelpers';
import { useCloudState } from '../App';

/**
 * SessionHistory Component
 * 
 * Displays session history grouped by date with statistics.
 * Features:
 * - Sessions grouped by date (Today, Yesterday, This Week, etc.)
 * - Completion status icons
 * - Summary statistics panel
 * - Export/Import buttons
 * 
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**
 */

// Session entry component
function SessionEntry({ session }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-kiro-bg rounded-lg">
      {/* Completion status icon */}
      <div className={`p-2 rounded-full ${
        session.completed 
          ? 'bg-kiro-success/20 text-kiro-success' 
          : 'bg-kiro-warning/20 text-kiro-warning'
      }`}>
        {session.completed ? <CheckCircle size={18} /> : <XCircle size={18} />}
      </div>
      
      {/* Session details */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">
            {formatDuration(session.duration)}
          </span>
          <span className="text-gray-500 text-sm">
            {session.completed ? 'Completed' : 'Abandoned'}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {formatTime(session.startTime)}
          {session.pauseCount > 0 && (
            <span className="ml-2">• {session.pauseCount} pause{session.pauseCount > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
      
      {/* Credits earned */}
      <div className="flex items-center gap-1 text-kiro-warning">
        <Zap size={14} />
        <span className="font-medium">+{session.creditsEarned}</span>
      </div>
    </div>
  );
}

// Session group component
function SessionGroup({ title, sessions }) {
  if (sessions.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-kiro-purple mb-2">{title}</h3>
      <div className="space-y-2">
        {sessions.map(session => (
          <SessionEntry key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}

// Statistics card component
function StatCard({ icon: Icon, label, value, subValue, color = 'kiro-purple' }) {
  return (
    <div className="bg-kiro-bg-light border border-kiro-purple/20 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={`text-${color}`} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className={`text-2xl font-bold text-${color}`}>{value}</div>
      {subValue && <div className="text-xs text-gray-500 mt-1">{subValue}</div>}
    </div>
  );
}

export default function SessionHistory() {
  const { state, actions } = useApp();
  const { sessionHistory } = state.userProgress;
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false);
  
  // Cloud state for auto-save
  const { triggerCloudSave } = useCloudState();
  
  const groupedSessions = groupSessionsByDate(sessionHistory);
  const stats = calculateStatistics(sessionHistory);

  // Handle export using storageHelpers
  const handleExport = () => {
    const jsonContent = exportData(state.userProgress, state.architecture);
    const filename = generateExportFilename();
    downloadFile(jsonContent, filename);
  };

  // Handle import using storageHelpers
  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImportError(null);
    setImportSuccess(false);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = importData(e.target?.result);
      
      if (!result.success) {
        setImportError(result.error);
        return;
      }
      
      // Import the validated data into state
      actions.importState(result.data);
      setImportSuccess(true);
      
      // Auto-save to cloud after successful import (Requirements 13.9)
      // Use setTimeout to ensure state is updated before saving
      setTimeout(() => {
        triggerCloudSave();
      }, 100);
      
      // Clear success message after 3 seconds
      setTimeout(() => setImportSuccess(false), 3000);
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Session History</h1>
          <p className="text-gray-400">Track your focus sessions and progress</p>
        </div>
        
        {/* Export/Import buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-kiro-bg-light border border-kiro-purple/30 
                     rounded-lg text-kiro-purple hover:border-kiro-purple transition-colors"
          >
            <Download size={16} />
            Export
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-kiro-bg-light border border-kiro-purple/30 
                          rounded-lg text-kiro-purple hover:border-kiro-purple transition-colors cursor-pointer">
            <Upload size={16} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {importError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {importError}
        </div>
      )}

      {importSuccess && (
        <div className="mb-4 p-3 bg-kiro-success/20 border border-kiro-success/50 rounded-lg text-kiro-success text-sm">
          Data imported successfully!
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Target}
          label="Total Sessions"
          value={stats.totalSessions}
          color="kiro-purple"
        />
        <StatCard
          icon={Clock}
          label="Total Focus Time"
          value={formatDuration(stats.totalFocusTime)}
          color="kiro-purple"
        />
        <StatCard
          icon={TrendingUp}
          label="Completion Rate"
          value={`${Math.round(stats.completionRate)}%`}
          color="kiro-success"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${stats.currentStreak} day${stats.currentStreak !== 1 ? 's' : ''}`}
          color="kiro-warning"
        />
      </div>

      {/* Additional stats row */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard
          icon={Clock}
          label="Average Session"
          value={formatDuration(Math.round(stats.averageSessionLength))}
          color="kiro-purple"
        />
        <StatCard
          icon={Zap}
          label="Total Credits Earned"
          value={stats.totalCreditsEarned}
          color="kiro-warning"
        />
      </div>

      {/* Session History */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-kiro-purple" />
          Session Log
        </h2>
        
        {sessionHistory.length === 0 ? (
          <div className="text-center py-12 bg-kiro-bg-light rounded-xl border border-kiro-purple/20">
            <Clock size={48} className="mx-auto text-kiro-purple/30 mb-4" />
            <p className="text-gray-500">No sessions yet</p>
            <p className="text-sm text-gray-600 mt-1">
              Complete your first focus session to see it here
            </p>
          </div>
        ) : (
          <div className="bg-kiro-bg-light rounded-xl border border-kiro-purple/20 p-4">
            <SessionGroup title="Today" sessions={groupedSessions.today} />
            <SessionGroup title="Yesterday" sessions={groupedSessions.yesterday} />
            <SessionGroup title="This Week" sessions={groupedSessions.thisWeek} />
            <SessionGroup title="Last Week" sessions={groupedSessions.lastWeek} />
            <SessionGroup title="Older" sessions={groupedSessions.older} />
          </div>
        )}
      </div>
    </div>
  );
}
