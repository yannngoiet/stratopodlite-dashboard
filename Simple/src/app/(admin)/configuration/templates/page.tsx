'use client';

import { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Badge, Spinner, Modal } from 'react-bootstrap';
import { LuUpload, LuFileText, LuStar, LuTrash2 } from 'react-icons/lu';
import { getCompanyId } from '@/helpers/config';

const API_BASE = process.env.NEXT_PUBLIC_PDF_API_URL;

interface Template {
  id: number;
  name: string;
  description: string;
  fileName: string;
  category: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  companyId: number;
}

const CATEGORIES = ['DELIVERY', 'INVOICE'];

const Page = () => {
  const companyId = getCompanyId();

  // ── Upload form state ──────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription]   = useState('');
  const [category, setCategory]         = useState('DELIVERY');
  const [uploading, setUploading]       = useState(false);
  const [uploadError, setUploadError]   = useState('');
  const [fieldErrors, setFieldErrors]   = useState<Record<string, string>>({});

  // ── Table state ────────────────────────────────────────────────────────────
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading]     = useState(false);
  const [actionId, setActionId]   = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Load templates on mount ────────────────────────────────────────────────
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/companies/${companyId}/templates?includeInactive=true`
      );
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!templateName.trim())
      errors.templateName = 'Template name is required.';

    if (!description.trim())
      errors.description = 'Description is required.';

    if (!selectedFile)
      errors.file = 'Please select a .docx file.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Upload ─────────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file && !templateName) {
      setTemplateName(file.name.replace(/\.[^/.]+$/, ''));
    }
    if (fieldErrors.file) {
      setFieldErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleUpload = async () => {
    setUploadError('');
    if (!validate()) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append('templateFile', selectedFile!);
      form.append('name', templateName.trim());
      form.append('description', description.trim());
      form.append('category', category);

      const res = await fetch(
        `${API_BASE}/api/companies/${companyId}/templates`,
        { method: 'POST', body: form }
      );

      if (!res.ok) {
        const err = await res.json();
        setUploadError(err?.error ?? 'Upload failed. Please try again.');
        return;
      }

      // ── Reset form ─────────────────────────────────────────────────────
      setSelectedFile(null);
      setTemplateName('');
      setDescription('');
      setCategory('DELIVERY');
      setFieldErrors({});
      const input = document.getElementById('templateFile') as HTMLInputElement;
      if (input) input.value = '';

      await fetchTemplates();
    } finally {
      setUploading(false);
    }
  };

  // ── Set default ────────────────────────────────────────────────────────────
  const handleSetDefault = async (id: number) => {
    setActionId(id);
    try {
      await fetch(
        `${API_BASE}/api/companies/${companyId}/templates/${id}/set-default`,
        { method: 'POST' }
      );
      await fetchTemplates();
    } finally {
      setActionId(null);
    }
  };

  // ── Delete template ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingTemplate) return;
    setDeleting(true);
    try {
      await fetch(
        `${API_BASE}/api/companies/${companyId}/templates/${deletingTemplate.id}`,
        { method: 'DELETE' }
      );
      setShowDeleteModal(false);
      setDeletingTemplate(null);
      await fetchTemplates();
    } finally {
      setDeleting(false);
    }
  };

  // ── Category badge colour ──────────────────────────────────────────────────
  const categoryVariant = (cat: string) =>
    cat === 'DELIVERY' ? 'primary' : 'secondary';

  return (
    <Container fluid className="py-3">

      {/* ── Upload Card ───────────────────────────────────────────────────── */}
      <div className="card shadow-sm mb-4">
        <div className="card-header py-2 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-semibold">Upload Template</h6>
          <span className="badge bg-secondary">Company ID: {companyId}</span>
        </div>
        <div className="card-body p-3">
          <div className="row g-3 align-items-start">

            {/* Template Name */}
            <div className="col-12 col-md-3">
              <Form.Label className="small fw-semibold">
                Template Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                size="sm"
                type="text"
                placeholder="e.g. Standard Delivery Note"
                value={templateName}
                isInvalid={!!fieldErrors.templateName}
                onChange={e => {
                  setTemplateName(e.target.value);
                  if (fieldErrors.templateName)
                    setFieldErrors(prev => ({ ...prev, templateName: '' }));
                }}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.templateName}
              </Form.Control.Feedback>
            </div>

            {/* Category */}
            <div className="col-12 col-md-2">
              <Form.Label className="small fw-semibold">Category</Form.Label>
              <Form.Select
                size="sm"
                value={category}
                onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Form.Select>
            </div>

            {/* Description */}
            <div className="col-12 col-md-3">
              <Form.Label className="small fw-semibold">
                Description <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                size="sm"
                type="text"
                placeholder="e.g. Standard delivery note template"
                value={description}
                isInvalid={!!fieldErrors.description}
                onChange={e => {
                  setDescription(e.target.value);
                  if (fieldErrors.description)
                    setFieldErrors(prev => ({ ...prev, description: '' }));
                }}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.description}
              </Form.Control.Feedback>
            </div>

            {/* File */}
            <div className="col-12 col-md-2">
              <Form.Label className="small fw-semibold">
                File <span className="text-muted">(.docx)</span>{' '}
                <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                id="templateFile"
                size="sm"
                type="file"
                accept=".docx"
                isInvalid={!!fieldErrors.file}
                onChange={handleFileChange}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.file}
              </Form.Control.Feedback>
            </div>

            {/* Upload Button */}
            <div className="col-12 col-md-2 d-flex align-items-end">
              <Button
                size="sm"
                variant="primary"
                onClick={handleUpload}
                disabled={uploading}
                className="w-100">
                {uploading
                  ? <><Spinner size="sm" className="me-1" />Uploading...</>
                  : <><LuUpload className="me-1" />Upload</>}
              </Button>
            </div>
          </div>

          {/* File preview */}
          {selectedFile && (
            <div className="mt-2 d-flex align-items-center gap-2 text-muted small">
              <LuFileText />
              <span>{selectedFile.name}</span>
              <Badge bg="secondary">{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
            </div>
          )}

          {/* API error */}
          {uploadError && (
            <div className="mt-2 alert alert-danger py-2 small mb-0">
              {uploadError}
            </div>
          )}
        </div>
      </div>

      {/* ── Templates Table ───────────────────────────────────────────────── */}
      <div className="card shadow-sm">
        <div className="card-header py-2 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-semibold">Uploaded Templates</h6>
          <Button size="sm" variant="outline-secondary" onClick={fetchTemplates}>
            Refresh
          </Button>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-4">
              <Spinner size="sm" className="me-2" />Loading templates...
            </div>
          ) : (
            <Table bordered hover size="sm" className="mb-0" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  {['#', 'Name', 'File', 'Category', 'Default', 'Active', 'Created', 'Actions'].map(h => (
                    <th
                      key={h}
                      className="py-2 px-3 text-uppercase"
                      style={{ backgroundColor: '#2c3e50', color: '#fff', fontWeight: 600, fontSize: '0.75rem' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {templates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
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
                        <Badge bg={categoryVariant(t.category)}>{t.category}</Badge>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {t.isDefault
                          ? <Badge bg="warning" text="dark">Default</Badge>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge bg={t.isActive ? 'success' : 'danger'}>
                          {t.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        {new Date(t.createdAt).toLocaleDateString('en-ZA')}
                      </td>
                      <td className="py-2 px-3">
                        <div className="d-flex gap-1">
                          {!t.isDefault && (
                            <Button
                              size="sm"
                              variant="outline-warning"
                              title="Set as Default"
                              disabled={actionId === t.id}
                              onClick={() => handleSetDefault(t.id)}>
                              {actionId === t.id
                                ? <Spinner size="sm" />
                                : <LuStar size={14} />}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline-danger"
                            title="Delete Template"
                            onClick={() => { setDeletingTemplate(t); setShowDeleteModal(true); }}>
                            <LuTrash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton style={{ background: '#dc3545', color: '#fff' }}>
          <Modal.Title style={{ fontSize: 15 }}>Delete Template</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-1">Are you sure you want to delete:</p>
          <strong>{deletingTemplate?.name}</strong>
          <p className="text-muted small mt-2 mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button size="sm" variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button size="sm" variant="danger" disabled={deleting} onClick={handleDelete}>
            {deleting ? 'Deleting...' : 'Yes, Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default Page;