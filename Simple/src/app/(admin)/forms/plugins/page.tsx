'use client';

import { Col, Container, Row } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import { LuPuzzle } from 'react-icons/lu';
import ReactFlatPicker from '@/app/(admin)/forms/plugins/components/ReactFlatPicker';
import ReactTypeahead from '@/app/(admin)/forms/plugins/components/ReactTypeahead';
import Touchspin from '@/app/(admin)/forms/plugins/components/Touchspin';
import dynamic from 'next/dynamic';
const ReactSelect = dynamic(() => import('@/app/(admin)/forms/plugins/components/ReactSelect'), {
  ssr: false
});
const Page = () => {
  return <Container fluid>
      <PageTitle title="Form Plugins" subtitle="Enhance your forms with powerful plugins like Flatpickr, Choices.js, Typeahead, and Input Touchspin for better interactivity." badge={{
      title: 'Enhanced Inputs',
      icon: LuPuzzle
    }} />

      <Row>
        <Col cols={12}>
          <ReactFlatPicker />

          <ReactSelect />

          <ReactTypeahead />

          <Touchspin />
        </Col>
      </Row>
    </Container>;
};
export default Page;