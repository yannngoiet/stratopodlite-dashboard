'use client';

import { options, states } from '@/app/(admin)/forms/plugins/data';
import TypeaheadClient from '@/components/client-wrapper/TypeaheadClient';
import { groupBy } from 'lodash';
import Link from 'next/link';
import { Fragment, useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Col, FormControl, Row } from 'react-bootstrap';
import { Highlighter, Hint, Menu, MenuItem, Token } from 'react-bootstrap-typeahead';
import { TbChevronRight } from 'react-icons/tb';

interface StateOption {
  name: string
  population: number
  region: string
}

const ReactTypeahead = () => {
  const [singleSelections, setSingleSelections] = useState<any[]>([]);
  return <Card>
      <CardHeader>
        <CardTitle as="h4">React Bootstrap Typeahead</CardTitle>
      </CardHeader>

      <CardBody>
        <p className="text-muted mb-2">A flexible library that provides a strong foundation for building robust typeaheads</p>

        <Link className="p-0 fw-semibold" href="https://ericgio.github.io/react-bootstrap-typeahead/" target="_blank">
          React Bootstrap Typeahead
          <TbChevronRight className="ms-1" />
        </Link>
      </CardBody>

      <CardBody>
        <Row className="g-3">
          <Col lg={6}>
            <h5 className="fw-semibold mb-1">Basic</h5>
          </Col>
          <Col lg={6}>
            <TypeaheadClient className="typeahead" labelKey="state" placeholder="Enter states from USA" options={options} selected={singleSelections} onChange={setSingleSelections} />
          </Col>
        </Row>

        <div className="my-4 border-top border-dashed"></div>

        <Row className="g-3">
          <Col lg={6}>
            <h5 className="fw-semibold mb-1">Multiple Selection</h5>
          </Col>
          <Col lg={6}>
            <TypeaheadClient className="typeahead" labelKey="state" placeholder="Enter states from USA" options={options} multiple />
          </Col>
        </Row>

        <div className="my-4 border-top border-dashed"></div>

        <Row className="g-3">
          <Col lg={6}>
            <h5 className="fw-semibold mb-1">Highlight The Only Result</h5>
          </Col>
          <Col lg={6}>
            <TypeaheadClient className="typeahead" labelKey="state" placeholder="Enter states from USA" options={options} highlightOnlyResult />
          </Col>
        </Row>

        <div className="my-4 border-top border-dashed"></div>

        <Row className="g-3">
          <Col lg={6}>
            <h5 className="fw-semibold mb-1">Require Minimum Input</h5>
          </Col>
          <Col lg={6}>
            <TypeaheadClient className="typeahead" labelKey="state" placeholder="Enter states from USA" options={options} minLength={3} />
          </Col>
        </Row>

        <div className="my-4 border-top border-dashed"></div>

        <Row className="g-3">
          <Col lg={6}>
            <h5 className="fw-semibold mb-1">Custom Input</h5>
          </Col>
          <Col lg={6}>
            <TypeaheadClient className="typeahead" labelKey="state" placeholder="Enter states from USA" options={options} renderInput={({ inputRef, referenceElementRef, ...inputProps }: any) => <Hint>
                  <FormControl {...inputProps} value={inputProps.value as string} ref={node => {
              inputRef(node);
              referenceElementRef(node);
            }} size="lg" />
                </Hint>} />
          </Col>
        </Row>

        <div className="my-4 border-top border-dashed"></div>

        <Row className="g-3">
          <Col lg={6}>
            <h5 className="fw-semibold mb-1">Custom Menu</h5>
          </Col>
          <Col lg={6}>
            <TypeaheadClient className="typeahead" labelKey="name" placeholder="Enter states from USA" options={states} renderMenu={(results: any[], { newSelectionPrefix, paginationText, renderMenuItemChildren, ...menuProps }: any, state: any) => {
            let index = 0;
            const regions = groupBy(results, 'region');
            const items = Object.keys(regions).sort().map(region => <Fragment key={region}>
                      {index !== 0 && <Menu.Divider />}
                      <Menu.Header>{region}</Menu.Header>
                      {regions[region].map(i => {
                const item = <MenuItem key={index} option={i} position={index}>
                            <Highlighter search={state.text}>{(i as StateOption).name}</Highlighter>
                          </MenuItem>;
                index += 1;
                return item;
              })}
                    </Fragment>);
            return <Menu {...menuProps}>{items}</Menu>;
          }} />
          </Col>
        </Row>

        <div className="my-4 border-top border-dashed"></div>

        <Row className="g-3">
          <Col lg={6}>
            <h5 className="fw-semibold mb-1">Custom Menu Item Contents</h5>
          </Col>
          <Col lg={6}>
            <TypeaheadClient className="typeahead" labelKey="name" placeholder="Enter states from USA" options={states} renderMenuItemChildren={(option: any, { text }: any) => <>
                  <Highlighter search={text}>{(option as StateOption).name}</Highlighter>,
                  <div>
                    <small>Population: {(option as StateOption).population.toLocaleString()}</small>
                  </div>
                </>} />
          </Col>
        </Row>

        <div className="my-4 border-top border-dashed"></div>

        <Row className="g-3">
          <Col lg={6}>
            <h5 className="fw-semibold mb-1">Custom Token</h5>
          </Col>
          <Col lg={6}>
            <TypeaheadClient className="typeahead" labelKey="name" placeholder="Enter states from USA" options={states} multiple renderToken={(option: any, { onRemove }: any, index: number) => <Token key={index} onRemove={onRemove} option={option}>
                  {`${(option as StateOption).name} (Pop: ${(option as StateOption).population.toLocaleString()})`}
                </Token>} />
          </Col>
        </Row>
      </CardBody>
    </Card>;
};
export default ReactTypeahead;