import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { logger } from '../lib/loggingService';

interface FileItem {
  key: string;
  size: number;
  last_modified: string;
  preview_url: string;
  download_url: string;
}

interface Client {
  id: string;
  full_name: string;
  address?: string;
}

interface ReportDate {
  date: string;
  reportIds: string[];
  hasPdf: boolean;
}

interface Report {
  id: string;
  created_at: string;
  pdf_uploaded: boolean;
  pdf_url: string | null;
}

const Library: React.FC<{ userEmail: string }> = ({ userEmail }) => {
  const API_BASE = process.env.REACT_APP_API_BASE || 'https://adminbackend.chimneysweeps.com';
  const API_KEY = process.env.REACT_APP_API_KEY || 'bestcompanyever23325';
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Data state
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [reportsByDate, setReportsByDate] = useState<Map<string, Report[]>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [files, setFiles] = useState<FileItem[]>([]);
  
  // Sorting
  const [clientSort, setClientSort] = useState<'az' | 'za'>('az');
  const [dateSort, setDateSort] = useState<'recent' | 'oldest'>('recent');
  const [fileSort, setFileSort] = useState<'recent' | 'oldest' | 'az' | 'za'>('recent');

  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  const slugifyClientName = (name: string) =>
    name.trim().replace(/\s+/g, '-').replace(/[^A-Za-z0-9-]/g, '');

  // Load all clients with addresses - OPTIMIZED
  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        if (!userData?.user?.id) throw new Error('Not signed in');

        // Get all clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, full_name')
          .order('full_name', { ascending: true });
        
        if (clientsError) throw clientsError;
        if (!clientsData || clientsData.length === 0) {
          setClients([]);
          return;
        }

        // Get latest report for each client with address in single query
        const clientIds = clientsData.map(c => c.id);
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select(`
            id,
            client_id,
            created_at,
            step1_json!inner(data)
          `)
          .in('client_id', clientIds)
          .order('created_at', { ascending: false });

        if (reportsError) {
          console.warn('Error fetching reports:', reportsError);
          setClients(clientsData);
          return;
        }

        // Get latest report per client with address
        const clientAddressMap = new Map<string, string>();
        (reportsData || []).forEach((report: any) => {
          if (!clientAddressMap.has(report.client_id)) {
            const step1Data = Array.isArray(report.step1_json) ? report.step1_json[0]?.data : report.step1_json?.data;
            const address = step1Data?.['Client Address'] || step1Data?.['clientAddress'];
            if (address) {
              clientAddressMap.set(report.client_id, address);
            }
          }
        });

        const clientsWithAddresses = clientsData.map(client => ({
          ...client,
          address: clientAddressMap.get(client.id)
        }));

        setClients(clientsWithAddresses);
      } catch (e: any) {
        console.error('Error loading clients:', e);
        setError(e?.message || 'Unable to load clients');
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  // Load all reports for selected client - OPTIMIZED
  const loadClientReports = useCallback(async (clientId: string) => {
    if (!clientId) {
      setReportsByDate(new Map());
      setSelectedDate('');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!userData?.user?.id) throw new Error('Not signed in');
      
      // Fetch ALL reports for this client in one query
      const { data: reportsData, error } = await supabase
        .from('reports')
        .select('id, created_at, pdf_uploaded, pdf_url')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (!reportsData || reportsData.length === 0) {
        setReportsByDate(new Map());
        return;
      }
      
      // Group reports by date
      const dateMap = new Map<string, Report[]>();
      reportsData.forEach(report => {
        const dateStr = report.created_at.slice(0, 10); // YYYY-MM-DD
        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, []);
        }
        dateMap.get(dateStr)!.push(report);
      });
      
      setReportsByDate(dateMap);
    } catch (e: any) {
      console.error('Error loading reports:', e);
      setError(e?.message || 'Unable to load reports');
      setReportsByDate(new Map());
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger report loading when client changes
  useEffect(() => {
    if (selectedClientId) {
      loadClientReports(selectedClientId);
    }
  }, [selectedClientId, loadClientReports]);

  // Load S3 PDFs for selected date
  const loadPDFsForDate = useCallback(async (dateISO: string) => {
    if (!dateISO || !selectedClient) return;
    
    const clientSlug = slugifyClientName(selectedClient.full_name);
    const prefix = `${clientSlug}/${dateISO}/`;
    
    setLoading(true);
    setError(null);
    
    try {
      const url = `${API_BASE}/directories?prefix=${encodeURIComponent(prefix)}`;
      const res = await fetch(url, { headers: { 'X-API-Key': API_KEY } });
      
      if (!res.ok) {
        console.warn(`S3 files not found for ${dateISO}`);
        setFiles([]);
        return;
      }
      
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        console.warn('Invalid response from S3');
        setFiles([]);
        return;
      }
      
      const data = await res.json();
      setFiles(Array.isArray(data?.files) ? data.files : []);
    } catch (e: any) {
      console.error('Error loading PDFs:', e);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, API_KEY, selectedClient]);

  // Handle edit report
  const handleEditReport = useCallback(async (reportId: string) => {
    if (!selectedClientId || !selectedDate || !reportId) return;
    
    setIsEditing(true);
    setError(null);
    
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!userData?.user?.id) throw new Error('Not signed in');

      // Log report being opened for editing
      await logger.logReportOpenedForEditing(
        userEmail,
        reportId,
        {
          client_name: selectedClient?.full_name || 'Unknown',
          date: selectedDate,
          source: 'library'
        }
      );

      // Store minimal context for editor
      localStorage.setItem('edit_context', JSON.stringify({ 
        clientId: selectedClientId, 
        date: selectedDate,
        reportId 
      }));
      
      window.dispatchEvent(new CustomEvent('app:navigate', { detail: { to: '/' } }));
    } catch (e: any) {
      console.error('Error opening report for edit:', e);
      setError(e?.message || 'Failed to open report for editing');
      
      await logger.logFrontendError(
        userEmail,
        'REPORT_OPEN_FAILED',
        e?.message || 'Failed to open report for editing',
        e?.stack,
        {
          client_id: selectedClientId,
          date: selectedDate,
          report_id: reportId,
          source: 'library'
        }
      );
    } finally {
      setIsEditing(false);
    }
  }, [selectedClientId, selectedDate, selectedClient, userEmail]);

  // Preview and download handlers
  const openPreview = useCallback((file: FileItem) => {
    setPreviewUrl(file.preview_url);
    setPreviewName(file.key.split('/').pop() || '');
    setPreviewLoading(true);
    setShowPreview(true);
    
    logger.logPdfPreviewOpened(
      userEmail,
      file.key.split('/').pop() || '',
      {
        file_name: file.key.split('/').pop() || '',
        file_size_bytes: file.size,
        client_name: selectedClient?.full_name
      }
    );
  }, [userEmail, selectedClient]);

  const handleDownload = useCallback((file: FileItem) => {
    const fileName = file.key.split('/').pop() || '';
    
    logger.logPdfDownloaded(
      userEmail,
      fileName,
      {
        file_name: fileName,
        file_size_bytes: file.size,
        client_name: selectedClient?.full_name,
        download_method: 'library'
      }
    );
    
    try {
      const win = window.open(file.download_url, '_blank', 'noopener');
      if (!win) {
        const a = document.createElement('a');
        a.href = file.download_url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e: any) {
      console.error('Download error:', e);
      logger.logFrontendError(
        userEmail,
        'PDF_DOWNLOAD_FAILED',
        e?.message || 'Download failed',
        e?.stack,
        { file_name: fileName, client_name: selectedClient?.full_name }
      );
    }
  }, [userEmail, selectedClient]);

  // Handle client selection
  const handleClientSelect = useCallback((clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedDate('');
    setFiles([]);
    setSearch(''); // Clear search when selecting a client
    
    const client = clients.find(c => c.id === clientId);
    if (client) {
      logger.logLibraryClientSelected(
        userEmail,
        client.full_name,
        {
          client_name: client.full_name,
          has_address: !!client.address
        }
      );
    }
  }, [clients, userEmail]);

  // Handle date selection
  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
    loadPDFsForDate(date);
    
    const reportsForDate = reportsByDate.get(date);
    logger.logLibraryDateSelected(
      userEmail,
      selectedClient?.full_name || 'Unknown',
      date,
      {
        client_name: selectedClient?.full_name,
        date,
        has_pdf: reportsForDate?.some(r => r.pdf_uploaded) || false,
        report_count: reportsForDate?.length || 0
      }
    );
  }, [loadPDFsForDate, reportsByDate, userEmail, selectedClient]);

  // Compute report dates from the map
  const reportDates: ReportDate[] = Array.from(reportsByDate.entries()).map(([date, reports]) => ({
    date,
    reportIds: reports.map(r => r.id),
    hasPdf: reports.some(r => r.pdf_uploaded)
  }));

  // Get reports for selected date
  const selectedDateReports = selectedDate ? reportsByDate.get(selectedDate) || [] : [];

  // Filtered and sorted data
  const filteredClients = clients
    .filter(c => {
      const searchLower = search.toLowerCase();
      const nameMatch = c.full_name.toLowerCase().includes(searchLower);
      const addressMatch = c.address?.toLowerCase().includes(searchLower) || false;
      return nameMatch || addressMatch;
    })
    .sort((a, b) => clientSort === 'az'
      ? a.full_name.localeCompare(b.full_name)
      : b.full_name.localeCompare(a.full_name)
    );

  const filteredDates = reportDates
    .filter(r => r.date.includes(search))
    .sort((a, b) => dateSort === 'recent' 
      ? b.date.localeCompare(a.date) 
      : a.date.localeCompare(b.date)
    );

  const filteredFiles = files
    .filter(f => f.key.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (fileSort === 'az') return a.key.localeCompare(b.key);
      if (fileSort === 'za') return b.key.localeCompare(a.key);
      const ta = new Date(a.last_modified).getTime();
      const tb = new Date(b.last_modified).getTime();
      return fileSort === 'recent' ? (tb - ta) : (ta - tb);
    });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Editing overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg px-6 py-5 border border-gray-200 max-w-sm w-full mx-4 text-center">
            <div className="mx-auto mb-3 w-10 h-10 rounded-full border-4 border-[#F0D8D6] border-t-[#722420] animate-spin" />
            <h4 className="text-base font-semibold text-gray-900 mb-1">Preparing editor…</h4>
            <p className="text-xs text-gray-500">Loading report data.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Report Library</h2>
          <p className="text-sm text-gray-500 mt-1">Browse and manage your reports</p>
        </div>
        <button 
          onClick={() => window.history.back()} 
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
        >
          Back
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-800 rounded">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-4 flex items-center justify-end">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients, dates, files..."
            className="w-full md:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
        </div>
      </div>

      {/* Breadcrumb */}
      {selectedClientId && (
        <div className="mb-2 text-sm text-gray-700">
          <button
            onClick={() => {
              setSelectedClientId('');
              setSelectedDate('');
              setFiles([]);
            }}
            className="text-[#722420] hover:underline"
          >
            Clients
          </button>
          <span className="mx-2 text-gray-400">/</span>
          <button
            onClick={() => {
              setSelectedDate('');
              setFiles([]);
            }}
            className="text-[#722420] hover:underline font-medium"
          >
            {selectedClient?.full_name || 'Client'}
          </button>
          {selectedDate && (
            <>
              <span className="mx-2 text-gray-400">/</span>
              <span className="font-medium text-gray-700">{selectedDate}</span>
            </>
          )}
        </div>
      )}

      {/* Main content */}
      {loading && !selectedClientId ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-[#F0D8D6] border-t-[#722420] animate-spin mb-3" />
          <div className="text-sm text-gray-700">Loading clients…</div>
        </div>
      ) : !selectedClientId ? (
        /* CLIENTS VIEW */
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Clients</h3>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5">
                <span className="font-medium">Sort</span>
                <select
                  aria-label="Sort clients"
                  value={clientSort}
                  onChange={(e) => setClientSort(e.target.value as 'az' | 'za')}
                  className="bg-white text-gray-700 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#722420]"
                >
                  <option value="az">A–Z</option>
                  <option value="za">Z–A</option>
                </select>
              </div>
              <span className="text-xs text-gray-500">{filteredClients.length}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-auto">
            {filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleClientSelect(client.id)}
                className="text-left p-3 rounded border border-gray-200 hover:border-[#722420] hover:bg-[#f6eae9] transition-colors"
              >
                <div className="font-medium text-gray-900">{client.full_name}</div>
                {client.address && (
                  <div className="text-sm text-gray-500 mt-1 truncate">{client.address}</div>
                )}
              </button>
            ))}
            {filteredClients.length === 0 && (
              <div className="col-span-full text-sm text-gray-500 text-center py-4">
                No clients found.
              </div>
            )}
          </div>
        </div>
      ) : !selectedDate ? (
        /* DATES VIEW */
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Report Dates</h3>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5">
                <span className="font-medium">Sort</span>
                <select
                  aria-label="Sort dates"
                  value={dateSort}
                  onChange={(e) => setDateSort(e.target.value as 'recent' | 'oldest')}
                  className="bg-white text-gray-700 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#722420]"
                >
                  <option value="recent">Recent first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
              <span className="text-xs text-gray-500">{filteredDates.length}</span>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-8 h-8 rounded-full border-4 border-[#F0D8D6] border-t-[#722420] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-auto">
              {filteredDates.map((dateObj) => (
                <button
                  key={dateObj.date}
                  onClick={() => handleDateSelect(dateObj.date)}
                  className="p-3 rounded border text-sm text-left border-gray-200 hover:border-[#722420] hover:bg-[#f6eae9] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{dateObj.date}</div>
                    <div className={`text-xs px-2 py-0.5 rounded ${dateObj.hasPdf ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {dateObj.hasPdf ? '✓ PDF' : 'Draft'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {dateObj.reportIds.length} report{dateObj.reportIds.length === 1 ? '' : 's'}
                  </div>
                </button>
              ))}
              {filteredDates.length === 0 && (
                <div className="col-span-full text-sm text-gray-500 text-center py-4">
                  No reports found for this client.
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* REPORTS VIEW */
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
            <div className="flex items-center gap-3">
              {filteredFiles.length > 0 && (
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5">
                  <span className="font-medium">Sort</span>
                  <select
                    aria-label="Sort files"
                    value={fileSort}
                    onChange={(e) => setFileSort(e.target.value as any)}
                    className="bg-white text-gray-700 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#722420]"
                  >
                    <option value="recent">Recent first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="az">A–Z</option>
                    <option value="za">Z–A</option>
                  </select>
                </div>
              )}
              <span className="text-xs text-gray-500">
                {selectedDateReports.length} report{selectedDateReports.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-8 h-8 rounded-full border-4 border-[#F0D8D6] border-t-[#722420] animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Show PDFs if they exist */}
              {filteredFiles.length > 0 ? (
                filteredFiles.map((file, index) => {
                  const fileName = file.key.split('/').pop() || '';
                  // Match PDF to report - use index as fallback
                  const correspondingReport = selectedDateReports[index] || selectedDateReports[0];
                  
                  return (
                    <div key={file.key} className="p-3 border border-gray-200 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{fileName}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(file.last_modified).toLocaleString()} • {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {correspondingReport && (
                          <button
                            onClick={() => handleEditReport(correspondingReport.id)}
                            className="px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => openPreview(file)}
                          className="px-3 py-2 text-sm rounded-md border border-[#722420] text-[#722420] hover:bg-[#f6eae9]"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleDownload(file)}
                          className="px-3 py-2 text-sm rounded-md bg-[#722420] text-white hover:bg-[#5a1d1a]"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Show draft reports when no PDFs */
                selectedDateReports.length > 0 ? (
                  selectedDateReports.map((report, index) => {
                    let timeStr = 'Unknown time';
                    try {
                      const date = new Date(report.created_at);
                      if (!isNaN(date.getTime())) {
                        timeStr = date.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        });
                      }
                    } catch (e) {
                      console.error('Error parsing date:', report.created_at, e);
                    }

                    return (
                      <div key={report.id} className="p-3 border border-gray-200 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-gray-900">Draft Report #{index + 1}</div>
                            <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">
                              {report.pdf_uploaded ? 'PDF Ready' : 'No PDF'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Created at {timeStr}
                          </div>
                        </div>
                        <button
                          onClick={() => handleEditReport(report.id)}
                          className="px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 flex-shrink-0"
                        >
                          Edit & Complete
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4">
                    No reports found for this date.
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl h-[85vh] flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="min-w-0 pr-4">
                <h4 className="text-base font-semibold text-gray-900 truncate">{previewName}</h4>
                <p className="text-xs text-gray-500">PDF Preview</p>
              </div>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setPreviewUrl(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                aria-label="Close preview"
              >
                ×
              </button>
            </div>
            <div className="flex-1 relative bg-gray-50">
              {previewLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-4 border-[#F0D8D6] border-t-[#722420] animate-spin" />
                </div>
              )}
              {previewUrl && (
                <iframe
                  src={previewUrl}
                  title={previewName}
                  className="w-full h-full"
                  onLoad={() => setPreviewLoading(false)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;


