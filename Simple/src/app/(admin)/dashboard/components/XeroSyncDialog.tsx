'use client';

import { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { LuCheck, LuCopy, LuBuilding2 } from 'react-icons/lu';
import httpClient from '@/services/api';

export interface XeroCompanyResult {
  companyId: number;
  companyName: string;
  isNew: boolean;
}

interface Props {
  companies: XeroCompanyResult[];
  onClose: () => void;
}

interface FormState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

const emptyForm: FormState = { firstName: '', lastName: '', username: '', email: '', password: '' };

type Step = 'overview' | 'form' | 'done';

export default function XeroSyncDialog({ companies, onClose }: Props) {
  const [step, setStep] = useState<Step>('overview');
  const [selectedCompany, setSelectedCompany] = useState<XeroCompanyResult | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [createdCreds, setCreatedCreds] = useState<{ username: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [createdFor, setCreatedFor] = useState<Set<number>>(new Set());

  const newCompanies = companies.filter(c => c.isNew);
  const existingCompanies = companies.filter(c => !c.isNew);

  const handleCreateUser = (company: XeroCompanyResult) => {
    setSelectedCompany(company);
    setForm(emptyForm);
    setFormError('');
    setStep('form');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCompany) return;
    setFormError('');
    setSubmitting(true);
    try {
      await httpClient.post('/api/auth/register', {
        companyId: selectedCompany.companyId,
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        password: form.password,
        confirmPassword: form.password,
        isSuperAdmin: false,
      });
      setCreatedCreds({ username: form.username, password: form.password });
      setCreatedFor(prev => new Set(prev).add(selectedCompany.companyId));
      setStep('done');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to create user. Please try again.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!createdCreds) return;
    navigator.clipboard.writeText(`Username: ${createdCreds.username}\nPassword: ${createdCreds.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CompanyRow = ({ company }: { company: XeroCompanyResult }) => (
    <div
      className="d-flex align-items-center gap-3 rounded p-3 mb-2"
      style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: '8px', flexShrink: 0,
        background: 'linear-gradient(135deg, #13B5EA, #0d8ab5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <LuBuilding2 size={18} color="#fff" />
      </div>
      <div className="flex-fill">
        <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{company.companyName}</div>
        <div className="d-flex align-items-center gap-2 mt-1">
          {company.isNew ? (
            <Badge bg="success" style={{ fontSize: '0.68rem' }}>New</Badge>
          ) : (
            <Badge bg="secondary" style={{ fontSize: '0.68rem' }}>Already Synced</Badge>
          )}
          {createdFor.has(company.companyId) && (
            <Badge bg="info" style={{ fontSize: '0.68rem' }}>User Created</Badge>
          )}
        </div>
      </div>
      {company.isNew && !createdFor.has(company.companyId) && (
        <Button size="sm" variant="primary" onClick={() => handleCreateUser(company)}
          style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
          Create User
        </Button>
      )}
    </div>
  );

  return (
    <Modal show onHide={onClose} centered backdrop="static">

      {/* ── Overview: all companies with status ── */}
      {step === 'overview' && (
        <>
          <Modal.Header className="border-0 pb-0">
            <Modal.Title className="d-flex align-items-center gap-2">
              <LuCheck size={22} className="text-success" />
              Xero Connected
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-3">
            {existingCompanies.length > 0 && newCompanies.length === 0 && (
              <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                All companies are already synced.
              </p>
            )}
            {newCompanies.length > 0 && (
              <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                {newCompanies.length === 1
                  ? '1 new company connected. Create a login for the admin?'
                  : `${newCompanies.length} new companies connected. Create logins for the admins?`}
              </p>
            )}
            {companies.map(c => <CompanyRow key={c.companyId} company={c} />)}
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="primary" onClick={onClose}>Done</Button>
          </Modal.Footer>
        </>
      )}

      {/* ── Form: create user for selected company ── */}
      {step === 'form' && selectedCompany && (
        <Form onSubmit={handleSubmit}>
          <Modal.Header className="border-0 pb-0">
            <Modal.Title>Create Admin — {selectedCompany.companyName}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-3">
            <div className="d-flex gap-2">
              <Form.Group className="mb-2 flex-fill">
                <Form.Label className="small mb-1">First Name</Form.Label>
                <Form.Control name="firstName" value={form.firstName} onChange={handleChange} required placeholder="John" size="sm" />
              </Form.Group>
              <Form.Group className="mb-2 flex-fill">
                <Form.Label className="small mb-1">Last Name</Form.Label>
                <Form.Control name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Smith" size="sm" />
              </Form.Group>
            </div>
            <Form.Group className="mb-2">
              <Form.Label className="small mb-1">Username</Form.Label>
              <Form.Control name="username" value={form.username} onChange={handleChange} required placeholder="john.smith" size="sm" />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small mb-1">Email</Form.Label>
              <Form.Control name="email" type="email" value={form.email} onChange={handleChange} required placeholder="john@company.com" size="sm" />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small mb-1">Password</Form.Label>
              <Form.Control name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} placeholder="Min 8 characters" size="sm" />
            </Form.Group>
            {formError && <Alert variant="danger" className="py-2 mb-0 small">{formError}</Alert>}
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="outline-secondary" onClick={() => setStep('overview')} disabled={submitting}>Back</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? <><Spinner size="sm" className="me-1" />Creating...</> : 'Create User'}
            </Button>
          </Modal.Footer>
        </Form>
      )}

      {/* ── Done: show credentials ── */}
      {step === 'done' && createdCreds && selectedCompany && (
        <>
          <Modal.Header className="border-0 pb-0">
            <Modal.Title className="d-flex align-items-center gap-2">
              <LuCheck size={22} className="text-success" />
              User Created — {selectedCompany.companyName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-3">
            <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>Share these credentials with the admin:</p>
            <div className="rounded p-3 mb-3"
              style={{ background: '#f8f9fa', fontFamily: 'monospace', fontSize: '0.9rem', border: '1px solid #e9ecef' }}>
              <div><span className="text-muted">Username: </span><strong>{createdCreds.username}</strong></div>
              <div><span className="text-muted">Password: </span><strong>{createdCreds.password}</strong></div>
            </div>
            <Button variant="outline-secondary" size="sm" onClick={handleCopy} className="d-flex align-items-center gap-1">
              {copied ? <LuCheck size={14} /> : <LuCopy size={14} />}
              {copied ? 'Copied!' : 'Copy credentials'}
            </Button>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="outline-secondary" onClick={() => setStep('overview')}>Back to Overview</Button>
            <Button variant="primary" onClick={onClose}>Done</Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
}
