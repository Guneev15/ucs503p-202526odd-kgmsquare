import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";
import { fetchAllMemories, generateTodaySummary, deleteSummary } from "../services/summaryService";
import { getUserId } from "../store/user";
import { Calendar, Clock, Sparkles, Zap, RefreshCw, Trash2, Search, Archive } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { formatDateIST, formatTimeIST } from "../utils/dateUtils";

const userId = getUserId();

interface SummaryPageProps {
  searchQuery?: string;
}

export default function SummaryPage({ searchQuery: externalSearchQuery = '' }: SummaryPageProps) {
  const { isDark } = useTheme();
  const [memories, setMemories] = useState<any[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMemories = () => {
    setLoading(true);
    fetchAllMemories(userId)
      .then((s) => {
        // Ensure array and sort by most recent first
        const memoriesArray = Array.isArray(s) ? s : [];
        const sortedMemories = memoriesArray.sort((a, b) => {
          const dateA = new Date(a.created_at || a.day || 0).getTime();
          const dateB = new Date(b.created_at || b.day || 0).getTime();
          return dateB - dateA; // Most recent first (descending)
        });
        setMemories(sortedMemories);
        setError("");
      })
      .catch((err: Error) => {
        console.error("Error loading memories:", err);
        setError(err.message || "Unknown error");
        setMemories([]);
      })
      .finally(() => setLoading(false));
  };

  const handleGenerateSummary = async () => {
    setGenerating(true);
    setGenerationError("");
    try {
      const result = await generateTodaySummary(userId);
      console.log("Generation result:", result);
      
      if (result.status === "success") {
        // Wait a bit for the database to update, then reload
        setTimeout(() => {
          loadMemories();
        }, 500);
      } else if (result.status === "no_logs") {
        setGenerationError("No activity logs found for today. Use the extension to track activities first.");
      } else {
        setGenerationError(result.message || "Failed to generate summary");
      }
    } catch (err: any) {
      console.error("Error generating summary:", err);
      setGenerationError(err.message || "Failed to generate summary");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteSummary = async (summaryId: string, summaryDate: string) => {
    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete the summary from ${summaryDate}?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    setDeletingId(summaryId);
    try {
      const result = await deleteSummary(summaryId);
      console.log("Delete result:", result);
      
      if (result.status === "success") {
        // Remove from local state immediately for instant feedback
        setMemories(prev => prev.filter(m => m.id !== summaryId));
        setFilteredMemories(prev => prev.filter(m => m.id !== summaryId));
      } else {
        setError(result.message || "Failed to delete summary");
      }
    } catch (err: any) {
      console.error("Error deleting summary:", err);
      setError(err.message || "Failed to delete summary");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter memories based on search query
  useEffect(() => {
    if (!Array.isArray(memories)) {
      setFilteredMemories([]);
      return;
    }

    if (!externalSearchQuery || externalSearchQuery.trim() === '') {
      setFilteredMemories(memories);
      return;
    }

    const query = externalSearchQuery.toLowerCase().trim();
    const filtered = memories.filter((memory) => {
      const summaryText = (memory.summary || '').toLowerCase();
      const dayText = (memory.day || '').toLowerCase();
      const createdText = (memory.created_at || '').toLowerCase();
      
      return summaryText.includes(query) || 
             dayText.includes(query) || 
             createdText.includes(query);
    });
    
    setFilteredMemories(filtered);
  }, [memories, externalSearchQuery]);

  useEffect(() => {
    try {
      loadMemories();
    } catch (err) {
      console.error("Error in useEffect:", err);
      setError("Failed to initialize page");
      setLoading(false);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      {/* Header Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Calendar size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold gradient-primary mb-2">
                Your Memories
              </h1>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {externalSearchQuery ? `Search results for "${externalSearchQuery}"` : 'A chronological log of your digital activities'}
              </p>
            </div>
          </div>
        </div>
        <div className="h-1 w-32 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full"></div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-12">
        <button
          onClick={handleGenerateSummary}
          disabled={generating}
          className="flex items-center gap-3 px-8 py-3 font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {generating ? (
            <>
              <RefreshCw size={20} className="animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Zap size={20} />
              <span>Generate Today's Summary</span>
            </>
          )}
        </button>

        <button
          onClick={loadMemories}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl border-2 border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {generationError && (
        <div className="mb-8 animate-slideIn">
          <Alert kind="error">{generationError}</Alert>
        </div>
      )}
      {error && (
        <div className="mb-8 animate-slideIn">
          <Alert kind="error">{error}</Alert>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-32">
          <div className="mb-4">
            <Spinner />
          </div>
          <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading your memories...
          </p>
        </div>
      )}

      {/* Memories Grid */}
      {!loading && !error && Array.isArray(filteredMemories) && filteredMemories.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {filteredMemories.length} of {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
            </p>
            {externalSearchQuery && (
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
          {filteredMemories.map((memory, index) => (
            <div
              key={memory.id}
              className="group card p-8 hover:shadow-2xl cursor-pointer transition-all duration-300 animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setExpandedId(expandedId === memory.id ? null : memory.id)}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                    <Clock size={24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                      {formatDateIST(memory.created_at)}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {formatTimeIST(memory.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30">
                    <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">AI Generated</span>
                  </div>
                </div>
              </div>

              {/* Summary Content */}
              <div className={`rounded-lg p-6 mb-4 transition-all duration-300 ${
                isDark 
                  ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' 
                  : 'bg-gradient-to-br from-purple-50 to-cyan-50 border border-purple-200/50'
              }`}>
                <div className={`text-base leading-relaxed ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                } line-clamp-4 group-hover:line-clamp-none transition-all`}>
                  {memory.summary}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {memory.id.substring(0, 8)}...
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSummary(memory.id, formatDateIST(memory.created_at));
                    }}
                    disabled={deletingId === memory.id}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                    title="Delete this summary"
                  >
                    {deletingId === memory.id ? (
                      <RefreshCw size={18} className="text-red-500 animate-spin" />
                    ) : (
                      <Trash2 size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded View */}
              {expandedId === memory.id && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 animate-slideIn">
                  <div className={`p-6 rounded-lg ${
                    isDark 
                      ? 'bg-slate-800/50 border border-slate-700' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Full Summary</h4>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {memory.summary}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Search Results State */}
      {!loading && !error && Array.isArray(filteredMemories) && filteredMemories.length === 0 && Array.isArray(memories) && memories.length > 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-8">
            <div className={`p-8 rounded-3xl inline-block mb-6 ${
              isDark 
                ? 'bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-900/30' 
                : 'bg-gradient-to-br from-purple-100 to-cyan-100 border border-purple-200'
            }`}>
              <Search size={64} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            No Results Found
          </h3>
          <p className={`text-lg mb-8 max-w-md ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No memories match your search for "{externalSearchQuery}". Try different keywords.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* No Memories State */}
      {!loading && !error && (!memories || memories.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-8">
            <div className={`p-8 rounded-3xl inline-block mb-6 ${
              isDark 
                ? 'bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-900/30' 
                : 'bg-gradient-to-br from-purple-100 to-cyan-100 border border-purple-200'
            }`}>
              <Archive size={64} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            No Memories Yet
          </h3>
          <p className={`text-lg mb-8 max-w-md ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Your activity summaries will appear here once generated. Click the button above to create your first summary!
          </p>
          <button
            onClick={handleGenerateSummary}
            disabled={generating}
            className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate First Summary'}
          </button>
        </div>
      )}
    </div>
  );
}