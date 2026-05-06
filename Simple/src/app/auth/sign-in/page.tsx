'use client';

import { useState } from 'react';
import { Button, Card, CardBody, Col, Container, Form, FormCheck, FormControl, FormGroup, FormLabel, Row } from 'react-bootstrap';
import AppLogo from '@/components/AppLogo';
import { appName, author, currentYear } from '@/helpers';
import Link from 'next/link';
import {useAuth} from '@/hooks/useAuth';

const Page = () => {
  const { login, error, loading } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(usernameOrEmail, password);
  };

  return (
    <div className="auth-box overflow-hidden align-items-center d-flex">
      <Container>
        <Row className="justify-content-center">
          <Col xxl={4} md={6} sm={8}>
            <Card>
              <CardBody>
                <div className="auth-brand mb-4">
                  <AppLogo />
                  <p className="text-muted w-lg-75 mt-3">
                    Let's get you signed in. Enter your username or email and password to continue.
                  </p>
                </div>

                <div>
                  <Form onSubmit={handleSubmit}>
                    <FormGroup className="mb-3">
                      <FormLabel htmlFor="userEmail">
                        Username or Email<span className="text-danger">*</span>
                      </FormLabel>
                      <FormControl
                        type="text"
                        id="userEmail"
                        placeholder="username or you@example.com"
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        required
                      />
                    </FormGroup>

                    <FormGroup className="mb-3">
                      <FormLabel htmlFor="userPassword">
                        Password <span className="text-danger">*</span>
                      </FormLabel>
                      <FormControl
                        type="password"
                        id="userPassword"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </FormGroup>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <FormCheck
                        className="fs-14"
                        type="checkbox"
                        label="Keep me signed in"
                      />
                      <Link
                        href="/auth/reset-password"
                        className="text-decoration-underline link-offset-3 text-muted"
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    {error && (
                      <div className="alert alert-danger py-2 mb-3">
                        {error}
                      </div>
                    )}

                    <div className="d-grid">
                      <Button
                        variant="primary"
                        type="submit"
                        className="fw-semibold py-2"
                        disabled={loading}
                      >
                        {loading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </div>
                  </Form>

                  <p className="text-muted text-center mt-4 mb-0">
                    New here?{' '}
                    <Link
                      href="/auth/sign-up"
                      className="text-decoration-underline link-offset-3 fw-semibold"
                    >
                      Create an account
                    </Link>
                  </p>
                </div>
              </CardBody>
            </Card>

            <p className="text-center text-muted mt-4 mb-0">
              © {currentYear} {appName} — by <span className="fw-semibold">{author}</span>
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Page;