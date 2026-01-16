import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { logger } from '../lib/loggingService';

interface DirectoryItem {
  name: string;
  prefix: string;
}

interface FileItem {
  key: string;
  size: number;
  last_modified: string;
  preview_url: string;
  download_url: string;
}

const Library: React.FC<{ userEmail: string }> = ({ userEmail }) => {
  const API_BASE = process.env.REACT_APP_API_BASE || 'https://adminbackend.chimneysweeps.com';
  const API_KEY = process.env.REACT_APP_API_KEY || 'bestcompanyever23325';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<DirectoryItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [pathStack, setPathStack] = useState<DirectoryItem[]>([]); // breadcrumb of selected dirs
  const [search, setSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Supabase-driven client -> reports by date selection
  const [clients, setClients] = useState<Array<{ id: string; full_name: string; address?: string }>>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [reportDates, setReportDates] = useState<Array<{ date: string; pdfUploaded: boolean; pdfUrl: string | null }>>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loadingSupabase, setLoadingSupabase] = useState(false);
  const selectedClient = clients.find(c => c.id === selectedClientId) || null;
  const [isEditing, setIsEditing] = useState(false);
  // Draft reports for selected date
  const [draftReports, setDraftReports] = useState<Array<{ id: string; created_at: string; pdf_uploaded: boolean }>>([]);
  // Sorting controls
  const [clientSort, setClientSort] = useState<'az' | 'za'>('az');
  const [dateSort, setDateSort] = useState<'recent' | 'oldest'>('recent');
  const [fileSort, setFileSort] = useState<'recent' | 'oldest' | 'az' | 'za'>('recent');

  // Constants for backend directories endpoint
  const S3_BUCKET = 'parth-reportify';
  const S3_REGION = 'us-east-1';

  const slugifyClientName = (name: string) =>
    name
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^A-Za-z0-9\-]/g, '');

  const fetchList = async (prefix?: string) => {
    setLoading(true);
    setError(null);
    try {
      // Call backend with API key header
      const url = prefix
        ? `${API_BASE}/directories?prefix=${encodeURIComponent(prefix)}`
        : `${API_BASE}/directories`;
      const res = await fetch(url, {
        headers: { 'X-API-Key': API_KEY }
      });
      if (!res.ok) throw new Error(`Failed to load directories: ${res.status}`);
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Expected JSON but received: ${text.slice(0, 120)}...`);
      }
      const data = await res.json();
      setItems(Array.isArray(data.directories) ? data.directories : []);
      setFiles(Array.isArray(data.files) ? data.files : []);
    } catch (e: any) {
      setError(e?.message || 'Unable to load directories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Backend directories listing disabled per requirements
  }, []);

  // Load clients for current user with addresses from reports
  useEffect(() => {
    const loadClients = async () => {
      setLoadingSupabase(true);
      setError(null);
      try {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        const userId = userData?.user?.id;
        if (!userId) throw new Error('Not signed in');

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

        // Get the most recent report for each client in a single query
        const clientIds = clientsData.map(c => c.id);
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('id, client_id, created_at')
          .in('client_id', clientIds)
          .order('created_at', { ascending: false });

        if (reportsError) {
          console.warn('Error fetching reports:', reportsError);
          // Continue without addresses if reports query fails
          setClients(clientsData.map(c => ({ ...c, address: undefined })));
          return;
        }

        // Group reports by client_id and get the most recent one for each
        const latestReportsByClient = new Map<string, string>();
        (reportsData || []).forEach((report: any) => {
          const clientId = report.client_id;
          if (!latestReportsByClient.has(clientId)) {
            latestReportsByClient.set(clientId, report.id);
          }
        });

        // Get step1_json data for all latest reports in one query
        const reportIds = Array.from(latestReportsByClient.values());
        const { data: step1Data, error: step1Error } = await supabase
          .from('step1_json')
          .select('report_id, data')
          .in('report_id', reportIds);

        if (step1Error) {
          console.warn('Error fetching step1_json:', step1Error);
          // Continue without addresses if step1_json query fails
          setClients(clientsData.map(c => ({ ...c, address: undefined })));
          return;
        }

        // Create a map of report_id -> address
        const addressMap = new Map<string, string>();
        (step1Data || []).forEach((step1: any) => {
          const step1Json = step1.data as any;
          const address = step1Json['Client Address'] || step1Json['clientAddress'];
          if (address) {
            addressMap.set(step1.report_id, address);
          }
        });

        // Map clients with their addresses
        const clientsWithAddresses = clientsData.map((client) => {
          const latestReportId = latestReportsByClient.get(client.id);
          const address = latestReportId ? addressMap.get(latestReportId) : undefined;
          return { ...client, address };
        });

        setClients(clientsWithAddresses);
      } catch (e: any) {
        setError(e?.message || 'Unable to load clients');
      } finally {
        setLoadingSupabase(false);
      }
    };
    loadClients();
  }, []);

  // When client changes, load distinct report dates for that client
  useEffect(() => {
    const loadReportDates = async () => {
      if (!selectedClientId) { setReportDates([]); setSelectedDate(''); return; }
      setLoadingSupabase(true);
      setError(null);
      try {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        const userId = userData?.user?.id;
        if (!userId) throw new Error('Not signed in');
        
        const { data, error } = await supabase
          .from('reports')
          .select('created_at, id, client_name, pdf_uploaded, pdf_url')
          .eq('client_id', selectedClientId)
          .order('created_at', { ascending: false });
        if (error) {
          console.error('Supabase error fetching report dates:', error);
          throw error;
        }
        console.log('Report dates data:', data);
        console.log('Number of reports found:', data?.length || 0);
        
        if (!data || data.length === 0) {
          console.log('No reports found for client:', selectedClientId);
          setReportDates([]);
          return;
        }
        
        // Group by date and track PDF upload status
        const dateMap = new Map<string, { pdfUploaded: boolean; pdfUrl: string | null }>();
        (data || []).forEach(r => {
          const createdAt = (r as any).created_at;
          if (!createdAt) {
            console.warn('Report with null created_at:', r);
            return;
          }
          
          let dateStr: string;
          if (typeof createdAt === 'string') {
            dateStr = createdAt.slice(0, 10);
          } else if (createdAt instanceof Date) {
            dateStr = createdAt.toISOString().slice(0, 10);
          } else {
            console.warn('Unknown date format:', createdAt);
            return;
          }
          
          // Store the first report's PDF status for each date
          if (!dateMap.has(dateStr)) {
            dateMap.set(dateStr, {
              pdfUploaded: (r as any).pdf_uploaded || false,
              pdfUrl: (r as any).pdf_url || null
            });
          }
        });
        
        const datesWithStatus = Array.from(dateMap.entries()).map(([date, status]) => ({
          date,
          pdfUploaded: status.pdfUploaded,
          pdfUrl: status.pdfUrl
        }));
        
        console.log('Dates with PDF status:', datesWithStatus);
        setReportDates(datesWithStatus);
      } catch (e: any) {
        console.error('Error loading report dates:', e);
        setError(e?.message || 'Unable to load report dates');
      } finally {
        setLoadingSupabase(false);
      }
    };
    loadReportDates();
  }, [selectedClientId]);

  // When date selected, query backend for that date
  const fetchReportsByDate = async (dateISO: string) => {
    if (!dateISO) return;
    // Guard: only proceed if Supabase has yielded this date
    if (!reportDates.find(r => r.date === dateISO)) return;
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;
    const clientSlug = slugifyClientName(client.full_name || 'client');
    const prefix = `${clientSlug}/${dateISO}/`;
    setLoading(true);
    setError(null);
    
    try {
      // Fetch S3 files (complete reports with PDFs)
      const url = `${API_BASE}/directories?prefix=${encodeURIComponent(prefix)}`;
      const res = await fetch(url, { headers: { 'X-API-Key': API_KEY } });
      if (!res.ok) throw new Error(`Failed to load reports for ${dateISO}: ${res.status}`);
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Expected JSON but received: ${text.slice(0, 120)}...`);
      }
      const data = await res.json();
      const filesResp = Array.isArray(data?.files) ? data.files : [];
      setFiles(filesResp as FileItem[]);
      setItems([]);
      
      // Fetch draft reports from Supabase for this date
      // dateISO format is "YYYY-MM-DD" (e.g., "2026-01-11")
      let startDate: Date;
      let endDate: Date;
      
      if (dateISO.includes('-')) {
        // Format: "YYYY-MM-DD"
        const [year, month, day] = dateISO.split('-');
        startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        endDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day) + 1);
      } else if (dateISO.includes('/')) {
        // Format: "M/D/YYYY" (backward compatibility)
        const [month, day, year] = dateISO.split('/');
        startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        endDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day) + 1);
      } else {
        console.error('Unknown date format:', dateISO);
        setDraftReports([]);
        return;
      }
      
      console.log('Parsing date:', dateISO);
      console.log('Date range:', { 
        start: startDate.toISOString(), 
        end: endDate.toISOString(),
        startValid: !isNaN(startDate.getTime()),
        endValid: !isNaN(endDate.getTime())
      });
      
      const { data: drafts, error: draftsError } = await supabase
        .from('reports')
        .select('id, created_at, pdf_uploaded')
        .eq('client_id', selectedClientId)
        .gte('created_at', startDate.toISOString())
        .lt('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });
      
      if (draftsError) {
        console.error('Error fetching draft reports:', draftsError);
        setDraftReports([]);
      } else {
        console.log('Draft reports fetched:', drafts);
        setDraftReports(drafts || []);
      }
    } catch (e: any) {
      setError(e?.message || 'Unable to load reports for date');
      setDraftReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Edit: verify report exists for selected client/date, then route to editor with context (no local cache of steps)
  const handleEditReport = async (reportId?: string) => {
    if (!selectedClientId || !selectedDate) return;
    setIsEditing(true);
    setError(null);
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const userId = userData?.user?.id;
      if (!userId) throw new Error('Not signed in');

      let finalReportId = reportId;
      
      // If no reportId provided, find the first report for the date (backward compatibility)
      if (!finalReportId) {
        const start = new Date(selectedDate + 'T00:00:00Z').toISOString();
        const end = new Date(new Date(selectedDate).getTime() + 24*60*60*1000).toISOString();

        const { data: reportsData, error: repErr } = await supabase
          .from('reports')
          .select('id, client_name, created_at')
          .eq('client_id', selectedClientId)
          .gte('created_at', start)
          .lt('created_at', end)
          .order('created_at', { ascending: false })
          .limit(1);
        if (repErr) throw repErr;
        const report = (reportsData || [])[0];
        if (!report) throw new Error('Report not found for selected date');
        finalReportId = report.id as string;
      }

      // Log report being opened for editing
      const clientName = selectedClient?.full_name || 'Unknown';
      await logger.logReportOpenedForEditing(
        userEmail,
        finalReportId,
        {
          client_name: clientName,
          date: selectedDate,
          source: 'library'
        }
      );

      // Only store minimal context; loader in form will fetch and map data
      localStorage.setItem('edit_context', JSON.stringify({ 
        clientId: selectedClientId, 
        date: selectedDate,
        reportId: finalReportId 
      }));
      window.dispatchEvent(new CustomEvent('app:navigate', { detail: { to: '/' } }));
    } catch (e: any) {
      setError(e?.message || 'Failed to prepare report for editing');
      
      // Log failed report open
      await logger.logFrontendError(
        userEmail,
        'REPORT_OPEN_FAILED',
        e?.message || 'Failed to prepare report for editing',
        e?.stack,
        {
          client_id: selectedClientId,
          date: selectedDate,
          source: 'library'
        }
      );
    } finally {
      setIsEditing(false);
    }
  };

  const handleEnter = async (dir: DirectoryItem) => {
    // Clear current view and show loader while navigating downwards
    setItems([]);
    setFiles([]);
    setLoading(true);
    setPathStack(prev => [...prev, dir]);
    await fetchList(dir.prefix);
  };

  const handleBreadcrumbClick = async (index: number) => {
    // index -1 means root
    // Clear current view and show loader while navigating upwards
    setItems([]);
    setFiles([]);
    setLoading(true);
    if (index < 0) {
      setPathStack([]);
      await fetchList();
      return;
    }
    const newStack = pathStack.slice(0, index + 1);
    setPathStack(newStack);
    const last = newStack[newStack.length - 1];
    await fetchList(last?.prefix);
  };

  const openPreview = (file: FileItem) => {
    setPreviewUrl(file.preview_url);
    setPreviewName(file.key.split('/').slice(-1)[0]);
    setPreviewLoading(true);
    setShowPreview(true);
    
    // Log PDF preview opened
    logger.logPdfPreviewOpened(
      userEmail,
      file.key.split('/').slice(-1)[0],
      {
        file_name: file.key.split('/').slice(-1)[0],
        file_size_bytes: file.size,
        client_name: selectedClient?.full_name
      }
    );
  };

  const handleDownload = (file: FileItem) => {
    // Log PDF download
    logger.logPdfDownloaded(
      userEmail,
      file.key.split('/').slice(-1)[0],
      {
        file_name: file.key.split('/').slice(-1)[0],
        file_size_bytes: file.size,
        client_name: selectedClient?.full_name,
        download_method: 'library'
      }
    );
    
    // Programmatic download to avoid exposing the signed URL in DOM markup
    try {
      const win = window.open(file.download_url, '_blank', 'noopener');
      if (!win) {
        // Fallback: create a temporary anchor and click it programmatically
        const a = document.createElement('a');
        a.href = file.download_url;
        a.download = file.key.split('/').slice(-1)[0];
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e: any) {
      // Log download failure
      logger.logFrontendError(
        userEmail,
        'PDF_DOWNLOAD_FAILED',
        e?.message || 'Download failed',
        e?.stack,
        {
          file_name: file.key.split('/').slice(-1)[0],
          client_name: selectedClient?.full_name
        }
      );
    }
  };

  // Supabase-driven filters - search by both name and address
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
    .sort((a, b) => dateSort === 'recent' ? (a.date < b.date ? 1 : a.date > b.date ? -1 : 0) : (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const filteredFiles = files
    .filter(f => f.key.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (fileSort === 'az') return a.key.localeCompare(b.key);
      if (fileSort === 'za') return b.key.localeCompare(a.key);
      // recent/oldest by last_modified
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
            <p className="text-xs text-gray-500">Fetching report data and caching it locally.</p>
          </div>
        </div>
      )}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Report Library</h2>
          <p className="text-sm text-gray-500 mt-1"> Universe of reports</p>
        </div>
        <button onClick={() => window.history.back()} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800">Back</button>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-800 rounded">{error}</div>
      )}

      {/* Search */}
      <div className="mb-4 flex items-center justify-between">
        <div />
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients by name or address..."
            className="w-full md:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
        </div>
      </div>

      {/* Clients and Dates from Supabase */}
      <div className="mb-4">
        {!selectedClientId ? (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Clients</h3>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5">
                  <span className="font-medium">Sort</span>
                  <select
                    aria-label="Sort clients"
                    value={clientSort}
                    onChange={(e) => setClientSort(e.target.value as any)}
                    className="bg-white text-gray-700 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#722420]"
                  >
                    <option value="az">A–Z</option>
                    <option value="za">Z–A</option>
                  </select>
                </div>
                <span className="text-xs text-gray-500">{filteredClients.length}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-auto pr-1">
              {loadingSupabase ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-8 h-8 rounded-full border-4 border-[#F0D8D6] border-t-[#722420] animate-spin" />
                </div>
              ) : (
                <>
                  {filteredClients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { 
                        setSelectedClientId(c.id); 
                        setSelectedDate(''); 
                        setFiles([]); 
                        setItems([]);
                        // Log client selected
                        logger.logLibraryClientSelected(
                          userEmail,
                          c.full_name,
                          {
                            client_name: c.full_name,
                            has_address: !!c.address
                          }
                        );
                      }}
                      className="text-left p-3 rounded border border-gray-200 hover:border-[#722420] hover:bg-[#f6eae9] transition-colors"
                    >
                      <div className="font-medium text-gray-900">{c.full_name}</div>
                      {c.address && (
                        <div className="text-sm text-gray-500 mt-1 truncate">{c.address}</div>
                      )}
                    </button>
                  ))}
                  {filteredClients.length === 0 && (
                    <div className="text-sm text-gray-500">No clients found.</div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <>
          <div className="mb-2 text-sm text-gray-700">
            <button
              onClick={() => { setSelectedClientId(''); setSelectedDate(''); setFiles([]); setItems([]); }}
              className="text-[#722420] hover:underline"
            >
              Directory
            </button>
            <span className="mx-2 text-gray-400">/</span>
            <span>{selectedClient?.full_name || 'Client'}</span>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Dates</h3>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5">
                  <span className="font-medium">Sort</span>
                  <select
                    aria-label="Sort dates"
                    value={dateSort}
                    onChange={(e) => setDateSort(e.target.value as any)}
                    className="bg-white text-gray-700 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#722420]"
                  >
                    <option value="recent">Recent first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </div>
                <span className="text-xs text-gray-500">{filteredDates.length}</span>
              </div>
            </div>
            {loadingSupabase ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-8 h-8 rounded-full border-4 border-[#F0D8D6] border-t-[#722420] animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredDates.map((dateObj) => {
                  const hasPdf = dateObj.pdfUploaded ?? false;
                  
                  return (
                  <button
                    key={dateObj.date}
                    onClick={() => { 
                      setSelectedDate(dateObj.date); 
                      fetchReportsByDate(dateObj.date);
                      // Log date selected
                      logger.logLibraryDateSelected(
                        userEmail,
                        selectedClient?.full_name || 'Unknown',
                        dateObj.date,
                        {
                          client_name: selectedClient?.full_name,
                          date: dateObj.date,
                          has_pdf: dateObj.pdfUploaded
                        }
                      );
                    }}
                    className={`p-3 rounded border text-sm text-left ${selectedDate === dateObj.date ? 'border-[#722420] bg-[#f6eae9] text-[#722420]' : 'border-gray-200 hover:border-[#722420] hover:bg-[#f6eae9]'}`}
                    disabled={loadingSupabase}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{dateObj.date}</div>
                      <div className={`text-xs px-2 py-0.5 rounded ${hasPdf ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {hasPdf ? '✓ PDF' : 'Draft'}
                      </div>
                    </div>
                  </button>
                  );
                })}
                {filteredDates.length === 0 && (
                  <div className="text-sm text-gray-500">No report dates.</div>
                )}
              </div>
            )}
          </div>
          </>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full border-4 border-[#F0D8D6] border-t-[#722420] animate-spin mb-3" />
          <div className="text-sm text-gray-700">Loading…</div>
        </div>
      ) : (
        <>
          {/* Show reports section when date is selected */}
          {selectedDate && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
                <div className="flex items-center gap-3">
                  {filteredFiles.length > 0 && (
                    <>
                      <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5">
                        <span className="font-medium">Sort</span>
                        <select
                          aria-label="Sort reports"
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
                      <span className="text-xs text-gray-500">{filteredFiles.length} file{filteredFiles.length === 1 ? '' : 's'}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Show files if they exist (complete reports with PDFs) */}
              {filteredFiles.length > 0 ? (
                <div className="space-y-3">
                  {filteredFiles.map((f) => {
                    // Get PDF upload status for selected date
                    const dateInfo = reportDates.find(rd => rd.date === selectedDate);
                    const hasPdfUploaded = dateInfo?.pdfUploaded ?? false;
                    
                    return (
                    <div key={f.key} className="p-3 border border-gray-200 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{f.key.split('/').slice(-1)[0]}</div>
                        <div className="text-xs text-gray-500">{new Date(f.last_modified).toLocaleString()} • {(f.size / (1024 * 1024)).toFixed(2)} MB</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditReport()}
                          className="px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                          disabled={!selectedClientId || !selectedDate}
                        >
                          Edit
                        </button>
                        {hasPdfUploaded && (
                          <>
                            <button
                              onClick={() => openPreview(f)}
                              className="px-3 py-2 text-sm rounded-md border border-[#722420] text-[#722420] hover:bg-[#f6eae9]"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => handleDownload(f)}
                              className="px-3 py-2 text-sm rounded-md bg-[#722420] text-white hover:bg-[#5a1d1a]"
                            >
                              Download
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                /* Show draft reports when no S3 files exist */
                <div className="space-y-3">
                  {draftReports.length > 0 ? (
                    draftReports.map((draft, index) => {
                      // Safe date parsing with fallback
                      let draftTime = 'Unknown time';
                      let draftDate = '';
                      try {
                        const date = new Date(draft.created_at);
                        if (!isNaN(date.getTime())) {
                          draftTime = date.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          });
                          draftDate = date.toLocaleDateString('en-US');
                        }
                      } catch (e) {
                        console.error('Error parsing date:', draft.created_at, e);
                      }
                      
                      return (
                        <div key={draft.id} className="p-3 border border-gray-200 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-gray-900">Draft Report #{index + 1}</div>
                              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">No PDF</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Created at {draftTime} • Report data saved • No PDF generated yet
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditReport(draft.id)}
                              className="px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                              disabled={!selectedClientId || !selectedDate}
                            >
                              Edit & Complete
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No reports found for this date.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl h-[85vh] flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="min-w-0 pr-4">
                <h4 className="text-base font-semibold text-gray-900 truncate">{previewName}</h4>
                <p className="text-xs text-gray-500 truncate">PDF Preview</p>
              </div>
              <button
                onClick={() => { setShowPreview(false); setPreviewUrl(null); }}
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


