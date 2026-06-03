'use client'

import React, { useState } from 'react'
import { Badge, Button, Col, Container, Form, Modal, Row } from 'react-bootstrap'
import { LuUser, LuLock, LuSave, LuTrash2 } from 'react-icons/lu'
import authService from '@/services/authService'
import httpClient from '@/services/api'
import { useRouter } from 'next/navigation'

const NAVY = '#2c3e50'

export default function UsersPage() {
  const currentUser = authService.getUser()
  const router = useRouter()

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [savingPw, setSavingPw] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await httpClient.delete('/api/auth/account')
      authService.logout()
      router.push('/auth/sign-in')
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const handleChangePassword = async () => {
    setPwError('')
    setPwSuccess('')
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwError('All fields are required.')
      return
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.')
      return
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.')
      return
    }
    setSavingPw(true)
    try {
      await httpClient.post('/api/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
        confirmPassword: pwForm.confirmPassword,
      })
      setPwSuccess('Password changed successfully.')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setPwError(err?.response?.data?.message ?? 'Failed to change password.')
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <Container fluid className="py-3" style={{ fontSize: 13 }}>
      <Row className="g-4">

        {/* Profile Details Card */}
        <Col md={6}>
          <div className="card shadow-sm h-100">
            <div className="card-header py-2" style={{ background: NAVY }}>
              <h6 className="mb-0 fw-semibold text-white">
                <LuUser size={14} className="me-2" />My Profile
              </h6>
            </div>
            <div className="card-body p-4">

              {/* Avatar */}
              <div className="text-center mb-4">
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', background: NAVY,
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 700, margin: '0 auto 10px',
                }}>
                  {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  {currentUser?.firstName} {currentUser?.lastName}
                </div>
                <Badge bg={currentUser?.role === 'SuperAdmin' ? 'danger' : 'secondary'} style={{ fontSize: 11 }}>
                  {currentUser?.role ?? 'User'}
                </Badge>
              </div>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Label style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>First Name</Form.Label>
                  <Form.Control size="sm" readOnly value={currentUser?.firstName ?? ''} style={{ background: '#f8f9fa' }} />
                </Col>
                <Col md={6}>
                  <Form.Label style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Last Name</Form.Label>
                  <Form.Control size="sm" readOnly value={currentUser?.lastName ?? ''} style={{ background: '#f8f9fa' }} />
                </Col>
                <Col md={12}>
                  <Form.Label style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Username</Form.Label>
                  <Form.Control size="sm" readOnly value={currentUser?.username ?? ''} style={{ background: '#f8f9fa' }} />
                </Col>
                <Col md={12}>
                  <Form.Label style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Email</Form.Label>
                  <Form.Control size="sm" readOnly value={currentUser?.email ?? ''} style={{ background: '#f8f9fa' }} />
                </Col>
                <Col md={6}>
                  <Form.Label style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Phone</Form.Label>
                  <Form.Control size="sm" readOnly value={currentUser?.phoneNumber ?? '—'} style={{ background: '#f8f9fa' }} />
                </Col>
                <Col md={6}>
                  <Form.Label style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Plant</Form.Label>
                  <Form.Control size="sm" readOnly value={currentUser?.plantId ?? '—'} style={{ background: '#f8f9fa' }} />
                </Col>
                <Col md={12}>
                  <Form.Label style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Last Login</Form.Label>
                  <Form.Control size="sm" readOnly
                    value={currentUser?.lastLoginAt ? new Date(currentUser.lastLoginAt).toLocaleString('en-ZA') : '—'}
                    style={{ background: '#f8f9fa' }} />
                </Col>
                <Col md={12} className="mt-3 pt-3" style={{ borderTop: '1px solid #dee2e6' }}>
                  <Button size="sm" variant="danger"
                    onClick={() => setShowDeleteModal(true)}>
                    <LuTrash2 size={13} className="me-1" />Delete Account
                  </Button>
                </Col>
              </Row>
            </div>
          </div>
        </Col>

        {/* Change Password Card */}
        <Col md={6}>
          <div className="card shadow-sm h-100">
            <div className="card-header py-2" style={{ background: NAVY }}>
              <h6 className="mb-0 fw-semibold text-white">
                <LuLock size={14} className="me-2" />Change Password
              </h6>
            </div>
            <div className="card-body p-4">
              <p className="text-muted small mb-4">
                Update your password. Must be at least 8 characters long.
              </p>

              {pwError && <div className="alert alert-danger py-2 small">{pwError}</div>}
              {pwSuccess && <div className="alert alert-success py-2 small">{pwSuccess}</div>}

              <Row className="g-3">
                <Col md={12}>
                  <Form.Label style={{ fontSize: 12 }}>Current Password <span className="text-danger">*</span></Form.Label>
                  <Form.Control size="sm" type="password" placeholder="Enter current password"
                    value={pwForm.currentPassword}
                    onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
                </Col>
                <Col md={12}>
                  <Form.Label style={{ fontSize: 12 }}>New Password <span className="text-danger">*</span></Form.Label>
                  <Form.Control size="sm" type="password" placeholder="Enter new password"
                    value={pwForm.newPassword}
                    onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
                </Col>
                <Col md={12}>
                  <Form.Label style={{ fontSize: 12 }}>Confirm New Password <span className="text-danger">*</span></Form.Label>
                  <Form.Control size="sm" type="password" placeholder="Confirm new password"
                    value={pwForm.confirmPassword}
                    onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                    isInvalid={!!pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword} />
                  <Form.Control.Feedback type="invalid">Passwords do not match.</Form.Control.Feedback>
                </Col>
                <Col md={12} className="mt-2">
                  <Button size="sm" style={{ background: NAVY, border: 'none' }}
                    disabled={savingPw} onClick={handleChangePassword}>
                    <LuSave size={13} className="me-1" />
                    {savingPw ? 'Saving...' : 'Update Password'}
                  </Button>
                </Col>
              </Row>
            </div>
          </div>
        </Col>

      </Row>
      {/* Delete Account Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton style={{ background: '#dc3545', color: '#fff' }}>
          <Modal.Title style={{ fontSize: 15 }}>Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">Are you sure you want to delete your account?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button size="sm" variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button size="sm" variant="danger" disabled={deleting} onClick={handleDeleteAccount}>
            {deleting ? 'Deleting...' : 'Yes, Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  )
}
