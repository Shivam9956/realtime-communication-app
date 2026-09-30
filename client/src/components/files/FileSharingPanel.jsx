import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  Download,
  Trash2,
  File,
  FileArchive,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const FileSharingPanel = ({ meetingId }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef(null);

  // 1. Fetch meeting files on mount
  const fetchFiles = async () => {
    setIsLoading(true);
    setUploadError('');
    try {
      const cleanId = meetingId?.trim().toLowerCase();
      const res = await api.request(`/files/meeting/${cleanId}`);
      if (res?.files) {
        setFiles(res.files);
      }
    } catch (err) {
      console.warn('Failed to load meeting files:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [meetingId]);

  // 2. Handle file selection & upload
  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check size limit (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds maximum 10MB limit.');
      return;
    }

    setUploadError('');
    setUploadSuccess('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('meetingId', meetingId.trim().toLowerCase());

      const token = localStorage.getItem('omnisync_token');
      const response = await fetch(`${api.baseUrl}/files`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'File upload failed');
      }

      setUploadSuccess(`Uploaded "${selectedFile.name}" successfully!`);
      setTimeout(() => setUploadSuccess(''), 3000);
      fetchFiles();
    } catch (err) {
      setUploadError(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 3. Delete file
  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Delete this file from the meeting?')) return;
    try {
      await api.request(`/files/${fileId}`, { method: 'DELETE' });
      setFiles((prev) => prev.filter((f) => (f.id || f._id) !== fileId));
    } catch (err) {
      alert(err.message || 'Failed to delete file.');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('image')) return <ImageIcon size={20} color="var(--primary-light)" />;
    if (mimeType?.includes('pdf')) return <FileText size={20} color="var(--rose)" />;
    if (mimeType?.includes('zip')) return <FileArchive size={20} color="var(--amber)" />;
    return <File size={20} color="var(--cyan)" />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem 1rem',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.02)',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          disabled={isUploading}
        />

        {isUploading ? (
          <div>
            <Loader2 size={24} className="spin" style={{ margin: '0 auto 0.5rem', color: 'var(--primary-light)' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Uploading file...</div>
          </div>
        ) : (
          <div>
            <Upload size={24} color="var(--primary-light)" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Click or drop to share file</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Max 10MB (PDF, PNG, JPG, DOC, ZIP, TXT)
            </div>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="auth-banner-error" style={{ marginBottom: 0, padding: '0.5rem 0.75rem' }}>
          <AlertCircle size={15} />
          <span style={{ fontSize: '0.8rem' }}>{uploadError}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="auth-banner-success" style={{ marginBottom: 0, padding: '0.5rem 0.75rem' }}>
          <CheckCircle2 size={15} />
          <span style={{ fontSize: '0.8rem' }}>{uploadSuccess}</span>
        </div>
      )}

      {/* Files List */}
      <div
        style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Shared Files ({files.length})
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            <Loader2 size={20} className="spin" style={{ margin: '0 auto 0.5rem' }} />
            <span style={{ fontSize: '0.85rem' }}>Loading shared files...</span>
          </div>
        ) : files.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No files shared in this meeting yet.
          </div>
        ) : (
          files.map((file) => {
            const isOwner = file.uploader === user?.id || file.uploader?._id === user?.id;
            const fileDownloadUrl = `${api.baseUrl.replace('/api', '')}${file.url}`;

            return (
              <div
                key={file.id || file._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.75rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                  {getFileIcon(file.mimeType)}
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 160,
                      }}
                      title={file.originalName}
                    >
                      {file.originalName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatFileSize(file.size)} • {file.uploaderName || 'User'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <a
                    href={fileDownloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={file.originalName}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Download}
                      title="Download file"
                    />
                  </a>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteFile(file.id || file._id)}
                      title="Delete file"
                      style={{ color: 'var(--rose)' }}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FileSharingPanel;
