'use client';

import { Card, CardBody, CardHeader, CardTitle, Container } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import { LuCloudUpload } from 'react-icons/lu';
import FileUploader from '@/components/FileUploader';
import Link from 'next/link';
import { useState } from 'react';
import { TbChevronRight } from 'react-icons/tb';
const Dropzone = () => {
  const [files, setFiles] = useState([]);
  return <Card>
      <CardHeader>
        <CardTitle as="h4">React Dropzone</CardTitle>
      </CardHeader>

      <CardBody>
        <p className="text-muted mb-2">Simple React hook and component to create a HTML5-compliant drag&#39;n&#39;drop zone for files.</p>

        <Link className="p-0 fw-semibold" href="https://github.com/react-dropzone/react-dropzone" target="_blank">
          React Dropzone
          <TbChevronRight className="ms-1" />
        </Link>
      </CardBody>

      <CardBody>
        <FileUploader files={files} setFiles={newFiles => setFiles(newFiles)} accept={{
        'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
      }} maxSize={1024 * 1024 * 10} maxFileCount={10} multiple />
      </CardBody>
    </Card>;
};
const Page = () => {
  return <Container fluid>
      <PageTitle title="File Upload with Dropzone" subtitle="Drag and drop files easily with Dropzone.js — a lightweight library for file previews, validations, and async uploads." badge={{
      title: 'Drag & Drop Uploads',
      icon: LuCloudUpload
    }} />

      <Dropzone />
    </Container>;
};
export default Page;