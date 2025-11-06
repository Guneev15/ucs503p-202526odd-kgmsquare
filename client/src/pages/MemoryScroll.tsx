import { useState, useEffect } from "react";
import { searchMemories } from "../services/searchService";
import { getUserId } from "../store/user";
import DashboardLayout from "../components/DashboardLayout";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";
import { Search, BrainCircuit } from "lucide-react";

const userId = getUserId();

interface Memory {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'audio';
  color: string;
  source: string;
}

export default function MemoryScroll() {
  const [query, setQuery] = useState("");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const results = await searchMemories(userId, query);
      // The backend returns a string that needs parsing.
      // This is a temporary solution until the backend is updated.
      const parsedResults = results.split('\n').map((line, index) => {
        const [content, timestamp] = line.split(' - ');
        return {
          id: `${timestamp}-${index}`,
          title: `Memory from ${new Date(timestamp).toLocaleString()}`,
          content: content.replace(/^\d+\.\s/, ''),
          timestamp,
          type: 'text',
          color: 'blue',
          source: 'Recall AI'
        } as Memory;
      });
      setMemories(parsedResults);
    } catch (err) {
      setError("Failed to fetch memories. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl">
              <BrainCircuit size={32} className="text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Explore Your Memories
            </h1>
          </div>
          <p className="text-xl text-gray-300 font-medium">
            Search through your digital past with AI-powered recall.
          </p>
        </div>

        {/* Search Bar */}
        <div className="sticky top-4 z-10">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a memory..."
              className="w-full pl-16 pr-6 py-5 text-lg text-white bg-gray-800/50 border border-purple-400/30 rounded-full focus:ring-2 focus:ring-purple-500 focus:outline-none backdrop-blur-sm transition-all duration-300"
            />
            <button type="submit" className="absolute inset-y-0 right-0 px-6 flex items-center bg-purple-600 rounded-full m-2 hover:bg-purple-700 transition-colors">
              Search
            </button>
          </form>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Spinner label="Searching your memories..." />
          </div>
        )}

        {error && <Alert kind="error">{error}</Alert>}

        {!isLoading && !error && memories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {memories.map((memory) => (
              <div key={memory.id} className="glass-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{memory.title}</h3>
                <p className="text-gray-600 mb-4">{memory.content}</p>
                <p className="text-xs text-gray-400">{new Date(memory.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && memories.length === 0 && !query && (
          <div className="text-center py-20">
            <p className="text-gray-400">Enter a query to start searching your memories.</p>
          </div>
        )}
        
        {!isLoading && !error && memories.length === 0 && query && (
          <div className="text-center py-20">
            <p className="text-gray-400">No memories found for your query.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
