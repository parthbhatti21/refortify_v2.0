import React, { useEffect, useState } from 'react';
import { loggingClient } from '../lib/loggingClient';

interface LogEntry {
  id: number;
  username: string;
  event_type: string;
  event_category: string;
  event_details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  report_id?: string;
  step_number?: number;
  section_name?: string;
  error_code?: string;
  error_message?: string;
  stack_trace?: string;
  created_at: string;
}

interface LogsProps {
  userEmail: string;
}

const Logs: React.FC<LogsProps> = ({ userEmail }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const logsPerPage = 50;

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterCategory, filterUser, searchTerm]);

  const fetchLogs = async () => {
    try {
      if (!loggingClient) {
        setError('Logging client not configured');
        setLoading(false);
        return;
      }

      setLoading(true);
      let query = loggingClient
        .from('user_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * logsPerPage, currentPage * logsPerPage - 1);

      if (filterCategory !== 'all') {
        query = query.eq('event_category', filterCategory);
      }

      if (filterUser !== 'all') {
        query = query.eq('username', filterUser);
      }

      if (searchTerm) {
        query = query.or(
          `event_type.ilike.%${searchTerm}%,report_id.ilike.%${searchTerm}%,error_message.ilike.%${searchTerm}%`
        );
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setLogs(data || []);
      if (count) {
        setTotalPages(Math.ceil(count / logsPerPage));
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      auth: 'bg-blue-100 text-blue-800',
      extraction: 'bg-green-100 text-green-800',
      report: 'bg-purple-100 text-purple-800',
      step: 'bg-yellow-100 text-yellow-800',
      image: 'bg-pink-100 text-pink-800',
      autosave: 'bg-indigo-100 text-indigo-800',
      pdf: 'bg-orange-100 text-orange-800',
      error: 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const uniqueUsers = Array.from(new Set(logs.map((log) => log.username)));

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading logs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Logs</h1>
        <p className="text-gray-600">Monitor all user activities and system events</p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Search event type, report ID, error..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Categories</option>
            <option value="auth">Authentication</option>
            <option value="extraction">Data Extraction</option>
            <option value="report">Reports</option>
            <option value="step">Steps</option>
            <option value="image">Images</option>
            <option value="autosave">Auto-save</option>
            <option value="pdf">PDF</option>
            <option value="error">Errors</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User
          </label>
          <select
            value={filterUser}
            onChange={(e) => {
              setFilterUser(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Users</option>
            {uniqueUsers.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(log.created_at)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {log.username}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                      log.event_category
                    )}`}
                  >
                    {log.event_category}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {log.event_type}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div className="max-w-md">
                    {log.report_id && (
                      <div className="mb-1">
                        <span className="font-medium">Report:</span> {log.report_id}
                      </div>
                    )}
                    {log.step_number && (
                      <div className="mb-1">
                        <span className="font-medium">Step:</span> {log.step_number}
                      </div>
                    )}
                    {log.section_name && (
                      <div className="mb-1">
                        <span className="font-medium">Section:</span> {log.section_name}
                      </div>
                    )}
                    {log.error_message && (
                      <div className="mb-1 text-red-600">
                        <span className="font-medium">Error:</span> {log.error_message}
                      </div>
                    )}
                    {log.event_details && Object.keys(log.event_details).length > 0 && (
                      <details className="cursor-pointer">
                        <summary className="text-blue-600 hover:text-blue-800">
                          View details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.event_details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {logs.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          No logs found matching your filters.
        </div>
      )}
    </div>
  );
};

export default Logs;
