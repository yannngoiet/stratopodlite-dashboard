import ComponentCard from '@/components/ComponentCard';
import Link from 'next/link';
import { Col, Row } from 'react-bootstrap';
const colorVariants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark', 'purple', 'pink', 'orange', 'light', 'link'];
const ColoredLinks = () => {
  return <>
      <h5 className="mb-2 pb-1">Colored Links</h5>
      {colorVariants.slice(0, 6).map((item, idx) => <p key={idx}>
          <Link href="" className={`link-${item}`}>
            {item.charAt(0).toUpperCase() + item.slice(1)} link
          </Link>
        </p>)}
      <p>
        <Link href="" className="link-light">
          Light link
        </Link>
      </p>
      <p>
        <Link href="" className="link-dark">
          Dark link
        </Link>
      </p>
      <p className="mb-0">
        <Link href="" className="link-body-emphasis">
          Emphasis link
        </Link>
      </p>
    </>;
};
const LinkUtilities = () => {
  return <>
      <h5 className="mb-2 pb-1">Link Utilities</h5>
      {colorVariants.slice(0, 6).map((item, idx) => <p key={idx}>
          <Link href="" className={`link-${item} text-decoration-underline link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover`}>
            {item.charAt(0).toUpperCase() + item.slice(1)} link
          </Link>
        </p>)}
      <p>
        <Link href="" className="link-light text-decoration-underline link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">
          Light link
        </Link>
      </p>
      <p>
        <Link href="" className="link-dark text-decoration-underline link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">
          Dark link
        </Link>
      </p>
      <p>
        <Link href="" className="link-body-emphasis text-decoration-underline link-offset-2 link-underline-opacity-25 link-underline-opacity-75-hover">
          Emphasis link
        </Link>
      </p>
    </>;
};
const LinkOpacity = () => {
  return <>
      <h5 className="mb-2 pb-1">Link Opacity</h5>
      <p>
        <Link className="link-opacity-10" href="">
          Link opacity 10
        </Link>
      </p>
      <p>
        <Link className="link-opacity-25" href="">
          Link opacity 25
        </Link>
      </p>
      <p>
        <Link className="link-opacity-50" href="">
          Link opacity 50
        </Link>
      </p>
      <p>
        <Link className="link-opacity-75" href="">
          Link opacity 75
        </Link>
      </p>
      <p className="mb-0">
        <Link className="link-opacity-100" href="">
          Link opacity 100
        </Link>
      </p>
    </>;
};
const LinkHoverOpacity = () => {
  return <>
      <h5 className="mb-2 pb-1">Link Hover Opacity</h5>
      <p>
        <Link className="link-opacity-10-hover" href="">
          Link hover opacity 10
        </Link>
      </p>
      <p>
        <Link className="link-opacity-25-hover" href="">
          Link hover opacity 25
        </Link>
      </p>
      <p>
        <Link className="link-opacity-50-hover" href="">
          Link hover opacity 50
        </Link>
      </p>
      <p>
        <Link className="link-opacity-75-hover" href="">
          Link hover opacity 75
        </Link>
      </p>
      <p className="mb-0">
        <Link className="link-opacity-100-hover" href="">
          Link hover opacity 100
        </Link>
      </p>
    </>;
};
const UnderlineColor = () => {
  return <>
      <h5 className="mb-2 pb-1">Underline Color </h5>
      <p>
        <Link href="" className="text-decoration-underline link-underline-primary">
          Primary underline
        </Link>
      </p>
      <p>
        <Link href="" className="text-decoration-underline link-underline-secondary">
          Secondary underline
        </Link>
      </p>
      <p>
        <Link href="" className="text-decoration-underline link-underline-success">
          Success underline
        </Link>
      </p>
      <p>
        <Link href="" className="text-decoration-underline link-underline-danger">
          Danger underline
        </Link>
      </p>
      <p>
        <Link href="" className="text-decoration-underline link-underline-warning">
          Warning underline
        </Link>
      </p>
      <p>
        <Link href="" className="text-decoration-underline link-underline-info">
          Info underline
        </Link>
      </p>
      <p>
        <Link href="" className="text-decoration-underline link-underline-light">
          Light underline
        </Link>
      </p>
      <p className="mb-0">
        <Link href="" className="text-decoration-underline link-underline-dark">
          Dark underline
        </Link>
      </p>
    </>;
};
const UnderlineOpacity = () => {
  return <>
      <h5 className="mb-2 pb-1">Underline Opacity</h5>
      <p>
        <Link className="text-decoration-underline link-offset-2 link-underline link-underline-opacity-0" href="#">
          Underline opacity 0
        </Link>
      </p>
      <p>
        <Link className="text-decoration-underline link-offset-2 link-underline link-underline-opacity-10" href="#">
          Underline opacity 10
        </Link>
      </p>
      <p>
        <Link className="text-decoration-underline link-offset-2 link-underline link-underline-opacity-25" href="#">
          Underline opacity 25
        </Link>
      </p>
      <p>
        <Link className="text-decoration-underline link-offset-2 link-underline link-underline-opacity-50" href="#">
          Underline opacity 50
        </Link>
      </p>
      <p>
        <Link className="text-decoration-underline link-offset-2 link-underline link-underline-opacity-75" href="#">
          Underline opacity 75
        </Link>
      </p>
      <p className="mb-0">
        <Link className="text-decoration-underline link-offset-2 link-underline link-underline-opacity-100" href="#">
          Underline opacity 100
        </Link>
      </p>
    </>;
};
const UnderlineOffset = () => {
  return <>
      <h5 className="mb-2 pb-1">Underline Offset</h5>
      <p>
        <Link href="">Default link</Link>
      </p>
      <p>
        <Link className="text-decoration-underline link-offset-1" href="">
          Offset 1 link
        </Link>
      </p>
      <p>
        <Link className="text-decoration-underline link-offset-2" href="">
          Offset 2 link
        </Link>
      </p>
      <p className="mb-0">
        <Link className="text-decoration-underline link-offset-3" href="">
          Offset 3 link
        </Link>
      </p>
    </>;
};
const HoverVariants = () => {
  return <>
      <h5 className="mb-2 pb-1">Hover Variants</h5>
      <Link className="link-offset-2 link-offset-3-hover text-decoration-underline link-underline link-underline-opacity-0 link-underline-opacity-75-hover" href="">
        Underline opacity 0
      </Link>
    </>;
};
const Links = () => {
  return <>
      <ComponentCard title="Links Variations" isCollapsible>
        <Row className="g-4">
          <Col xl={6}>
            <ColoredLinks />
          </Col>
          <Col xl={6}>
            <LinkUtilities />
          </Col>
          <Col xl={6}>
            <LinkOpacity />
          </Col>
          <Col xl={6}>
            <LinkHoverOpacity />
          </Col>
          <Col xl={6}>
            <UnderlineColor />
          </Col>
          <Col xl={6}>
            <UnderlineOpacity />
          </Col>
          <Col xl={6}>
            <UnderlineOffset />
          </Col>
          <Col xl={6}>
            <HoverVariants />
          </Col>
        </Row>
      </ComponentCard>
    </>;
};
export default Links;