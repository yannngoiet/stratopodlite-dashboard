'use client';

import { useState } from 'react';
import { Container, Form, Button, Table, Badge } from 'react-bootstrap';
import { LuUpload, LuFileText, LuTrash2, LuDownload } from 'react-icons/lu';
import { getCompanyId } from '@/helpers/config';

interface UploadedTemplate {
  id: number;
  name: string;
  fileName: string;
  companyId: number;
  uploadedAt: string;
}

const Page = () => {
  const companyId = getCompanyId();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [templates, setTemplates] = useState<UploadedTemplate[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file && !templateName) {
      setTemplateName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !templateName.trim()) return;
    setUploading(true);
    try {
      // UI only — wire to POST /api/templates when Yannick adds the endpoint
      const newTemplate: UploadedTemplate = {
        id: Date.now(),
        name: templateName.trim(),
        fileName: selectedFile.name,
        companyId,
        uploadedAt: new Date().toLocaleString('en-ZA'),
      };
      setTemplates(prev => [newTemplate, ...prev]);
      setSelectedFile(null);
      setTemplateName('');
      const input = document.getElementById('templateFile') as HTMLInputElement;
      if (input) input.value = '';
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: number) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  return (
    <Container fluid className="py-3">
      {/* Upload Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-header py-2 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-semibold">Upload Template</h6>
          <span className="badge bg-secondary">Company ID: {companyId}</span>
        </div>
        <div className="card-body p-3">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-5">
              <Form.Label className="small fw-semibold">Template Name</Form.Label>
              <Form.Control
                size="sm"
                type="text"
                placeholder="e.g. Standard Delivery Note"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-5">
              <Form.Label className="small fw-semibold">
                Template File <span className="text-muted">(.docx)</span>
              </Form.Label>
              <Form.Control
                id="templateFile"
                size="sm"
                type="file"
                accept=".docx,.doc"
                onChange={handleFileChange}
              />
            </div>
            <div className="col-12 col-md-2">
              <Button
                size="sm"
                variant="primary"
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !templateName.trim()}
                className="w-100">
                <LuUpload className="me-1" />
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>

          {selectedFile && (
            <div className="mt-2 d-flex align-items-center gap-2 text-muted small">
              <LuFileText />
              <span>{selectedFile.name}</span>
              <Badge bg="secondary">{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
            </div>
          )}
        </div>
      </div>

      {/* Templates Table */}
      <div className="card shadow-sm">
        <div className="card-header py-2">
          <h6 className="mb-0 fw-semibold">Uploaded Templates</h6>
        </div>
        <div className="card-body p-0">
          <Table bordered hover size="sm" className="mb-0" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr>
                {['#', 'Template Name', 'File', 'Company ID', 'Uploaded At', 'Actions'].map((h) => (
                  <th key={h} className="py-2 px-3 text-uppercase"
                    style={{ backgroundColor: '#2c3e50', color: '#fff', fontWeight: 600, fontSize: '0.75rem' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    No templates uploaded yet
                  </td>
                </tr>
              ) : (
                templates.map((t, i) => (
                  <tr key={t.id}>
                    <td className="py-2 px-3">{i + 1}</td>
                    <td className="py-2 px-3">{t.name}</td>
                    <td className="py-2 px-3">
                      <LuFileText className="me-1 text-muted" />
                      {t.fileName}
                    </td>
                    <td className="py-2 px-3">
                      <Badge bg="info">{t.companyId}</Badge>
                    </td>
                    <td className="py-2 px-3">{t.uploadedAt}</td>
                    <td className="py-2 px-3">
                      <div className="d-flex gap-1">
                        <Button
                          size="sm"
                          variant="outline-success"
                          title="Download"
                          onClick={() => alert(`Download: ${t.fileName}`)}>
                          <LuDownload size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          title="Delete"
                          onClick={() => handleDelete(t.id)}>
                          <LuTrash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </Container>
  );
};

export default Page;
