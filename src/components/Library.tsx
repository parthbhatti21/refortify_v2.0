import React, { useEffect, useState } from 'react';

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

const Library: React.FC = () => {
  const API_BASE = process.env.REACT_APP_API_BASE ;
  const API_KEY = process.env.REACT_APP_API_KEY;
  console.log(API_BASE, API_KEY);
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

  const fetchList = async (prefix?: string) => {
    setLoading(true);
    setError(null);
    try {
      // Call backend with API key header
      const url = prefix
        ? `${API_BASE}/directories?bucket=parth-reportify&region=us-east-1&prefix=${encodeURIComponent(prefix)}`
        : `${API_BASE}/directories`;
      const res = await fetch(url, {
        headers: API_KEY ? { 'X-API-Key': API_KEY } : undefined
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
    fetchList();
  }, []);

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
  };

  const handleDownload = (file: FileItem) => {
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
    } catch (_) {
      // no-op
    }
  };

  const filteredDirs = items.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.prefix.toLowerCase().includes(search.toLowerCase())
  );
  const filteredFiles = files.filter(f =>
    f.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      {/* Breadcrumb + Search */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-gray-700">
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className={`hover:underline ${pathStack.length === 0 ? 'font-semibold' : ''}`}
          >
            Report Library
          </button>
          {pathStack.map((seg, i) => (
            <span key={seg.prefix}>
              <span className="mx-2 text-gray-400">/</span>
              <button
                onClick={() => handleBreadcrumbClick(i)}
                className={`hover:underline ${i === pathStack.length - 1 ? 'font-semibold' : ''}`}
              >
                {seg.name}
              </button>
            </span>
          ))}
        </div>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search folders or files..."
            className="w-full md:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full border-4 border-[#F0D8D6] border-t-[#722420] animate-spin mb-3" />
          <div className="text-sm text-gray-700">Loading…</div>
        </div>
      ) : (
        <>
          {filteredDirs.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{pathStack.length === 0 ? 'Report Library' : 'Folders'}</h3>
                <span className="text-xs text-gray-500">{filteredDirs.length} folder{filteredDirs.length === 1 ? '' : 's'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredDirs.map((d) => (
                  <button
                    key={d.prefix}
                    onClick={() => handleEnter(d)}
                    className="w-full text-left p-3 border border-gray-200 rounded hover:border-[#722420] hover:bg-[#f6eae9] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-[#F8EDEC] border border-[#F0D8D6] flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#722420]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h5l2 3h11v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{d.name}</div>
                        <div className="text-xs text-gray-500">{d.prefix}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredFiles.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
                <span className="text-xs text-gray-500">{filteredFiles.length} file{filteredFiles.length === 1 ? '' : 's'}</span>
              </div>
              <div className="space-y-3">
                {filteredFiles.map((f) => (
                  <div key={f.key} className="p-3 border border-gray-200 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">{f.key.split('/').slice(-1)[0]}</div>
                      <div className="text-xs text-gray-500">{new Date(f.last_modified).toLocaleString()} • {(f.size / (1024 * 1024)).toFixed(2)} MB</div>
                    </div>
                    <div className="flex items-center gap-2">
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
                    </div>
                  </div>
                ))}
              </div>
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


