import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Upload, 
  FileText, 
  Download, 
  Merge, 
  LogOut, 
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { apiService } from '../lib/api';

export const Dashboard = ({ user, onLogout, getIdToken }) => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getIdToken();
      const response = await apiService.listDocuments(token);
      setDocuments(response.documents || []);
    } catch (error) {
      setError(`Failed to load documents: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      setError('Only .docx files are supported');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const token = await getIdToken();
      await apiService.uploadDocument(file, token);
      setSuccess('Document uploaded successfully!');
      await loadDocuments();
      // Clear the file input
      event.target.value = '';
    } catch (error) {
      setError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentSelect = (docPath, checked) => {
    if (checked) {
      setSelectedDocs([...selectedDocs, docPath]);
    } else {
      setSelectedDocs(selectedDocs.filter(path => path !== docPath));
    }
  };

  const handleMergeDocuments = async () => {
    if (selectedDocs.length < 2) {
      setError('Please select at least 2 documents to merge');
      return;
    }

    try {
      setMerging(true);
      setError(null);
      const token = await getIdToken();
      const response = await apiService.mergeDocuments(selectedDocs, token);
      setSuccess(`Documents merged successfully! File: ${response.merged_filename}`);
      setSelectedDocs([]);
      await loadDocuments();
    } catch (error) {
      setError(`Merge failed: ${error.message}`);
    } finally {
      setMerging(false);
    }
  };

  const handleDownload = async (blobPath, filename) => {
    try {
      setError(null);
      const token = await getIdToken();
      const blob = await apiService.downloadDocument(blobPath, token);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess(`Downloaded ${filename}`);
    } catch (error) {
      setError(`Download failed: ${error.message}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DocuMerge</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.email}</p>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Upload Documents
            </CardTitle>
            <CardDescription>
              Upload Word documents (.docx) to your library
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".docx"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Your Documents
                </CardTitle>
                <CardDescription>
                  Select documents to merge or download individually
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleMergeDocuments}
                  disabled={selectedDocs.length < 2 || merging}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {merging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Merge className="mr-2 h-4 w-4" />
                  Merge Selected ({selectedDocs.length})
                </Button>
                <Button variant="outline" onClick={loadDocuments} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading documents...
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No documents uploaded yet</p>
                <p className="text-sm">Upload your first .docx file to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedDocs.includes(doc.path)}
                        onCheckedChange={(checked) => handleDocumentSelect(doc.path, checked)}
                      />
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>{formatDate(doc.updated)}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc.path, doc.name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

