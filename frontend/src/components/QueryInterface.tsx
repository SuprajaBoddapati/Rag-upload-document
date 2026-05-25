import { useState } from "react";
import axios from "axios";

import "./QueryInterface.css";

interface QueryResponse {
  response?: string;
  message?: string;
  sources?: string[];
}

interface SearchHistoryItem {
  query: string;
  timestamp: string;
}

function QueryInterface() {

  const [query, setQuery] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const [results, setResults] = useState<QueryResponse | null>(null);

  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);


  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    if (!query.trim()) {

      setError("Please enter a query");

      return;
    }

    setLoading(true);

    setError(null);

    setResults(null);

    try {

      const response = await axios.post<QueryResponse>(
        "/api/rag/query",
        {
          query: query,
        }
      );

      setResults(response.data);

      setSearchHistory([
        {
          query: query,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...searchHistory.slice(0, 4),
      ]);

    } catch (err: any) {

      if (
        err.code === "ERR_NETWORK" ||
        err.response?.status === 404
      ) {

        setError(
          "Query endpoint not yet implemented. Please implement POST /api/rag/query endpoint."
        );

      } else {

        setError(
          err.response?.data?.detail ||
          "Error querying documents"
        );
      }

    } finally {

      setLoading(false);
    }
  };


  const handleHistoryClick = (
    historyQuery: string
  ) => {

    setQuery(historyQuery);
  };


  const clearHistory = () => {

    setSearchHistory([]);
  };


  return (

    <div className="query-interface">

      <form
        onSubmit={handleSubmit}
        className="query-form"
      >

        <div className="input-group">

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="query-input"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className={`query-btn ${loading ? "loading" : ""}`}
            title="Search documents"
          >

            {
              loading
                ? "🔄"
                : "🔍"
            }

          </button>

        </div>

        <p className="query-hint">
          💡 Type your question and press Enter
        </p>

      </form>


      {
        error && (

          <div className="alert alert-error">

            <span className="alert-icon">
              ⚠️
            </span>

            <span>
              {error}
            </span>

          </div>
        )
      }


      {
        results && (

          <div className="results">

            <div className="result-item response-item">

              <div className="result-header">

                <h3>
                  ✨ Response
                </h3>

                <span className="result-time">
                  Just now
                </span>

              </div>

              <p className="result-text">

                {
                  results.response ||
                  results.message ||
                  "No response generated"
                }

              </p>

            </div>


            {
              results.sources &&
              results.sources.length > 0 && (

                <div className="sources">

                  <div className="sources-header">

                    <h3>
                      📖 Relevant Sources
                    </h3>

                  </div>

                  <ul className="sources-list">

                    {
                      results.sources.map((
                        source,
                        index
                      ) => (

                        <li
                          key={index}
                          className="source-item"
                        >

                          <div className="source-number">
                            {index + 1}
                          </div>

                          <p className="source-text">
                            {source}
                          </p>

                        </li>
                      ))
                    }

                  </ul>

                </div>
              )
            }

          </div>
        )
      }


      {
        !results &&
        !error && (

          <div className="placeholder">

            <div className="placeholder-icon">
              🤔
            </div>

            <p>
              Ask a question about your documents
            </p>

          </div>
        )
      }


      {
        searchHistory.length > 0 && (

          <div className="search-history">

            <div className="history-header">

              <h4>
                📋 Search History
              </h4>

              <button
                type="button"
                className="clear-history-btn"
                onClick={clearHistory}
              >
                Clear
              </button>

            </div>


            <ul className="history-list">

              {
                searchHistory.map((
                  item,
                  index
                ) => (

                  <li
                    key={index}
                    className="history-item"
                  >

                    <button
                      type="button"
                      className="history-btn"
                      onClick={() =>
                        handleHistoryClick(item.query)
                      }
                    >

                      <span className="history-query">
                        {item.query}
                      </span>

                      <span className="history-time">
                        {item.timestamp}
                      </span>

                    </button>

                  </li>
                ))
              }

            </ul>

          </div>
        )
      }

    </div>
  );
}

export default QueryInterface;