'use client'

import { useState, useEffect } from 'react'
import { Container, Badge, Modal } from 'react-bootstrap'
import { LuUpload, LuFileText, LuStar, LuTrash2, LuLayoutTemplate } from 'react-icons/lu'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCompanyId } from '@/helpers/config'
import templateService, { type Template } from '@/services/templateService'

const CATEGORIES = ['DELIVERY', 'INVOICE']

const Page = () => {
  const companyId = getCompanyId()

  const [selectedFile, setSelectedFile]   = useState<File | null>(null)
  const [templateName, setTemplateName]   = useState('')
  const [description, setDescription]     = useState('')
  const [category, setCategory]           = useState('DELIVERY')
  const [uploading, setUploading]         = useState(false)
  const [uploadError, setUploadError]     = useState('')
  const [fieldErrors, setFieldErrors]     = useState<Record<string, string>>({})

  const [templates, setTemplates]         = useState<Template[]>([])
  const [loading, setLoading]             = useState(false)
  const [actionId, setActionId]           = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal]     = useState(false)
  const [deletingTemplate, setDeletingTemplate]   = useState<Template | null>(null)
  const [deleting, setDeleting]           = useState(false)

  useEffect(() => { fetchTemplates() }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const data = await templateService.getAll(companyId)
      setTemplates(data)
    } catch (err) {
      console.error(err); setTemplates([])
    } finally { setLoading(false) }
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!templateName.trim()) errors.templateName = 'Template name is required.'
    if (!description.trim())  errors.description  = 'Description is required.'
    if (!selectedFile)        errors.file         = 'Please select a .docx file.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setSelectedFile(file)
    if (file && !templateName) setTemplateName(file.name.replace(/\.[^/.]+$/, ''))
    if (fieldErrors.file) setFieldErrors(prev => ({ ...prev, file: '' }))
  }

  const handleUpload = async () => {
    setUploadError('')
    if (!validate()) return
    setUploading(true)
    try {
      await templateService.upload(companyId, {
        templateFile: selectedFile!,
        name: templateName.trim(),
        description: description.trim(),
        category,
      })
      setSelectedFile(null); setTemplateName(''); setDescription(''); setCategory('DELIVERY'); setFieldErrors({})
      const input = document.getElementById('templateFile') as HTMLInputElement
      if (input) input.value = ''
      await fetchTemplates()
    } catch (err: any) {
      setUploadError(err?.response?.data?.error ?? 'Upload failed. Please try again.')
    } finally { setUploading(false) }
  }

  const handleSetDefault = async (id: number) => {
    setActionId(id)
    try { await templateService.setDefault(companyId, id); await fetchTemplates() }
    catch (err) { console.error(err) }
    finally { setActionId(null) }
  }

  const handleDelete = async () => {
    if (!deletingTemplate) return
    setDeleting(true)
    try {
      await templateService.delete(companyId, deletingTemplate.id)
      setShowDeleteModal(false); setDeletingTemplate(null); await fetchTemplates()
    } finally { setDeleting(false) }
  }

  return (
    <Container fluid className="py-3">

      {/* Upload Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-header d-flex justify-content-between align-items-center py-2">
          <h6 className="mb-0 fw-semibold d-flex align-items-center gap-2">
            <LuLayoutTemplate size={15} /> Upload Template
          </h6>
          <span className="badge badge-blue" style={{ fontSize: 11 }}>Company ID: {companyId}</span>
        </div>
        <div className="card-body p-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1" style={{ flex: '2 1 180px' }}>
              <label className="field-label">Template Name <span className="text-red-500">*</span></label>
              <input className={`dash-filter-input ${fieldErrors.templateName ? 'border-red-400' : ''}`}
                placeholder="e.g. Standard Delivery Note"
                value={templateName}
                onChange={e => { setTemplateName(e.target.value); if (fieldErrors.templateName) setFieldErrors(p => ({ ...p, templateName: '' })) }} />
              {fieldErrors.templateName && <span style={{ fontSize: 11, color: '#ef4444' }}>{fieldErrors.templateName}</span>}
            </div>
            <div className="flex flex-col gap-1" style={{ flex: '1 1 130px' }}>
              <label className="field-label">Category</label>
              <select className="dash-filter-input" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1" style={{ flex: '2 1 180px' }}>
              <label className="field-label">Description <span className="text-red-500">*</span></label>
              <input className={`dash-filter-input ${fieldErrors.description ? 'border-red-400' : ''}`}
                placeholder="e.g. Standard delivery note template"
                value={description}
                onChange={e => { setDescription(e.target.value); if (fieldErrors.description) setFieldErrors(p => ({ ...p, description: '' })) }} />
              {fieldErrors.description && <span style={{ fontSize: 11, color: '#ef4444' }}>{fieldErrors.description}</span>}
            </div>
            <div className="flex flex-col gap-1" style={{ flex: '2 1 180px' }}>
              <label className="field-label">File (.docx) <span className="text-red-500">*</span></label>
              <input id="templateFile" type="file" accept=".docx"
                className={`dash-filter-input ${fieldErrors.file ? 'border-red-400' : ''}`}
                style={{ padding: '3px 8px' }}
                onChange={handleFileChange} />
              {fieldErrors.file && <span style={{ fontSize: 11, color: '#ef4444' }}>{fieldErrors.file}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label opacity-0 select-none">.</label>
              <Button size="sm" disabled={uploading} onClick={handleUpload}
                className="flex items-center gap-1.5 btn-blue rounded-md whitespace-nowrap px-4">
                <LuUpload size={13} /> {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>

          {selectedFile && (
            <div className="flex items-center gap-1.5 mt-2 text-muted" style={{ fontSize: 13 }}>
              <LuFileText size={14} /> {selectedFile.name}
              <Badge bg="secondary" style={{ fontSize: 10 }}>{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
            </div>
          )}

          {uploadError && (
            <div className="mt-2 alert alert-danger py-2 mb-0" style={{ fontSize: 13 }}>{uploadError}</div>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center py-2">
          <h6 className="mb-0 fw-semibold">Uploaded Templates</h6>
          <Button size="sm" variant="outline" onClick={fetchTemplates} disabled={loading}
            className="flex items-center gap-1.5 rounded-md">
            <RotateCcw size={13} /> Refresh
          </Button>
        </div>
        <div className="card-body p-3">
          <div className="table-responsive">
            <table className="table table-hover table-sm align-middle mb-0">
              <thead className="dash-thead-dark">
                <tr>
                  {['#', 'Name', 'File', 'Category', 'Default', 'Active', 'Created', 'Actions'].map(h => (
                    <th key={h} className="py-2 px-3 text-uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.85rem' }}>
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                  </td></tr>
                ) : templates.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-4 text-muted">No templates uploaded yet</td></tr>
                ) : (
                  templates.map((t, i) => (
                    <tr key={t.id}>
                      <td className="py-2 px-3"><span className="dash-cell-muted">{i + 1}</span></td>
                      <td className="py-2 px-3">{t.name}</td>
                      <td className="py-2 px-3">
                        <span className="flex items-center gap-1 dash-cell-muted">
                          <LuFileText size={13} /> {t.fileName}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <Badge bg={t.category === 'DELIVERY' ? 'primary' : 'secondary'}>{t.category}</Badge>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {t.isDefault ? <Badge bg="warning" text="dark">Default</Badge> : <span className="dash-cell-muted">—</span>}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge bg={t.isActive ? 'success' : 'danger'}>{t.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="py-2 px-3">
                        <span className="dash-cell-muted">{new Date(t.createdAt).toLocaleDateString('en-ZA')}</span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex gap-1">
                          {!t.isDefault && (
                            <Button size="sm" variant="outline" title="Set as Default"
                              disabled={actionId === t.id}
                              className="rounded-md px-2 btn-outline-amber"
                              onClick={() => handleSetDefault(t.id)}>
                              {actionId === t.id
                                ? <span className="spinner-border spinner-border-sm" role="status" />
                                : <LuStar size={11} />}
                            </Button>
                          )}
                          <Button size="sm" variant="outline" title="Delete Template"
                            className="rounded-md px-2 btn-outline-red"
                            onClick={() => { setDeletingTemplate(t); setShowDeleteModal(true) }}>
                            <LuTrash2 size={11} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton className="modal-header-dark">
          <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>Delete Template</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p className="mb-1">Are you sure you want to delete:</p>
          <strong>{deletingTemplate?.name}</strong>
          <p className="text-muted mt-2 mb-0" style={{ fontSize: 12 }}>This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #dde3f0', padding: '0.75rem 1.25rem' }}>
          <Button size="sm" variant="outline" className="rounded-md px-4" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button size="sm" disabled={deleting} className="rounded-md px-4 btn-outline-red" onClick={handleDelete}>
            {deleting ? 'Deleting...' : 'Yes, Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  )
}

export default Page
