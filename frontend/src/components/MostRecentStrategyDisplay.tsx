import React, { useState, useEffect } from 'react';

interface StrategyOutput {
  timestamp: string; // Assuming timestamp is converted to string (ISO format) by backend
  description: string; // This is what you're using for 'description'
  // Add other properties if you decide to display them later, e.g.:
  // tool_name?: string;
  // tool_output_data?: any; // Or a more specific type for your backtest data
}

const MostRecentStrategyDisplay = () => {
  const [strategy, setStrategy] = useState<StrategyOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentStrategy = async () => {
      try {
        setLoading(true);
        setError(null);
        // Ensure this URL matches your backend's URL and endpoint
        const response = await fetch('http://localhost:8000/api/most_recent_strategy');
        
        if (!response.ok) {
          if (response.status === 404) {
            setStrategy(null); // Explicitly set to null if no strategy found
            return; // No error, just no data
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success && result.data) {
            console.log("Most recent strategy data:", result.data);
          setStrategy(result.data);
        } else {
          setStrategy(null);
          setError(result.message || 'Failed to fetch strategy data.');
        }
      } catch (e) {
        console.error("Error fetching most recent strategy:", e);
        setError("Could not load recent strategy. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentStrategy();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="sticky p-4 bg-gray-800 text-gray-200 rounded-lg shadow-lg animate-pulse">
        <p className="text-lg font-semibold mb-2">Loading Recent Strategy...</p>
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-800 text-white rounded-lg shadow-lg">
        <p className="text-lg font-semibold mb-2">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="p-4 bg-gray-800 text-gray-400 rounded-lg shadow-lg">
        <p className="text-lg font-semibold mb-2">No Recent Strategy Found</p>
        <p className="text-sm">Run a backtest to see results here!</p>
      </div>
    );
  }

  if (strategy) {
    return (
      <div className="p-4 bg-gray-800 text-gray-200 rounded-lg shadow-lg">
        <p className="text-lg font-semibold mb-2">Most Recent Strategy</p>
        <p className="text-sm">{strategy.description}</p>
        <p>{}</p>
      </div>
    );
  }
}

export default MostRecentStrategyDisplay;