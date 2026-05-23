'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { LuCheck, LuCopy, LuBuilding2 } from 'react-icons/lu';
import httpClient from '@/services/api';

interface Props {
  companyId: number;
  fallbackName?: string;
  onClose: () => void;
}

interface CompanyInfo {
  id: number;
  companyName: string;
  companyType: string;
  isActive: boolean;
}

type Step = 'prompt' | 'form' | 'done';

interface FormState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

const emptyForm: FormState = { firstName: '', lastName: '', username: '', email: '', password: '' };

export default function XeroSyncDialog({ companyId, fallbackName = '', onClose }: Props) {
  const [company, setCompany] = useState<CompanyInfo>({
    id: companyId,
    companyName: fallbackName,
    companyType: '',
    isActive: true,
  });
  const [loadingCompany, setLoadingCompany] = useState(true);

  const [step, setStep] = useState<Step>('prompt');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [createdCreds, setCreatedCreds] = useState<{ username: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    httpClient
      .get<CompanyInfo>(`/api/companies/${companyId}`)
      .then(res => setCompany(res.data))
      .catch(() => { /* keep fallback name already set */ })
      .finally(() => setLoadingCompany(false));
  }, [companyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await httpClient.post('/api/auth/register', {
        companyId,
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        password: form.password,
        confirmPassword: form.password,
        isSuperAdmin: false,
      });
      setCreatedCreds({ username: form.username, password: form.password });
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
    const text = `Username: ${createdCreds.username}\nPassword: ${createdCreds.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CompanyCard = () => (
    <div
      className="d-flex align-items-center gap-3 rounded p-3 mb-3"
      style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}
    >
      <div
        style={{
          width: 42, height: 42, borderRadius: '10px',
          background: 'linear-gradient(135deg, #13B5EA, #0d8ab5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        <LuBuilding2 size={20} color="#fff" />
      </div>
      <div className="flex-fill">
        <div className="fw-semibold" style={{ fontSize: '0.95rem' }}>
          {company.companyName || (loadingCompany ? <Spinner size="sm" /> : '—')}
        </div>
        <div className="d-flex align-items-center gap-2 mt-1">
          {company.companyType && (
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>
              {company.companyType}
            </span>
          )}
          {!loadingCompany && (
            <Badge bg={company.isActive ? 'success' : 'secondary'} style={{ fontSize: '0.7rem' }}>
              {company.isActive ? 'Active' : 'Inactive'}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Modal show onHide={onClose} centered backdrop="static">
      {step === 'prompt' && (
        <>
          <Modal.Header className="border-0 pb-0">
            <Modal.Title className="d-flex align-items-center gap-2">
              <LuCheck size={22} className="text-success" />
              Xero Connected
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-3">
            <CompanyCard />
            <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
              Do you want to create a login for this company&apos;s admin?
            </p>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="outline-secondary" onClick={onClose}>
              Skip
            </Button>
            <Button variant="primary" onClick={() => setStep('form')}>
              Yes, Create User
            </Button>
          </Modal.Footer>
        </>
      )}

      {step === 'form' && (
        <Form onSubmit={handleSubmit}>
          <Modal.Header className="border-0 pb-0">
            <Modal.Title>Create Admin User</Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-3">
            <CompanyCard />

            <div className="d-flex gap-2">
              <Form.Group className="mb-2 flex-fill">
                <Form.Label className="small mb-1">First Name</Form.Label>
                <Form.Control
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                  size="sm"
                />
              </Form.Group>
              <Form.Group className="mb-2 flex-fill">
                <Form.Label className="small mb-1">Last Name</Form.Label>
                <Form.Control
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Smith"
                  size="sm"
                />
              </Form.Group>
            </div>

            <Form.Group className="mb-2">
              <Form.Label className="small mb-1">Username</Form.Label>
              <Form.Control
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="john.smith"
                size="sm"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="small mb-1">Email</Form.Label>
              <Form.Control
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="john@company.com"
                size="sm"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="small mb-1">Password</Form.Label>
              <Form.Control
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Min 8 characters"
                size="sm"
              />
            </Form.Group>

            {formError && (
              <Alert variant="danger" className="py-2 mb-0 small">{formError}</Alert>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="outline-secondary" onClick={() => setStep('prompt')} disabled={submitting}>
              Back
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? <><Spinner size="sm" className="me-1" />Creating...</> : 'Create User'}
            </Button>
          </Modal.Footer>
        </Form>
      )}

      {step === 'done' && createdCreds && (
        <>
          <Modal.Header className="border-0 pb-0">
            <Modal.Title className="d-flex align-items-center gap-2">
              <LuCheck size={22} className="text-success" />
              User Created
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-3">
            <CompanyCard />
            <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
              Share these credentials with the admin:
            </p>
            <div
              className="rounded p-3 mb-3"
              style={{ background: '#f8f9fa', fontFamily: 'monospace', fontSize: '0.9rem', border: '1px solid #e9ecef' }}
            >
              <div><span className="text-muted">Username: </span><strong>{createdCreds.username}</strong></div>
              <div><span className="text-muted">Password: </span><strong>{createdCreds.password}</strong></div>
            </div>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleCopy}
              className="d-flex align-items-center gap-1"
            >
              {copied ? <LuCheck size={14} /> : <LuCopy size={14} />}
              {copied ? 'Copied!' : 'Copy credentials'}
            </Button>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="primary" onClick={onClose}>Done</Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
}
