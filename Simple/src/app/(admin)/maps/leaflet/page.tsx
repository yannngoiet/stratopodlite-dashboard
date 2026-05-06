'use client';

import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from 'react-bootstrap';
import marketImg from '@/assets/images/leaflet/marker-icon.png';
import markerShadowImg from '@/assets/images/leaflet/marker-shadow.png';
import leafGreen from '@/assets/images/leaflet/leaf-green.png';
import leafOrange from '@/assets/images/leaflet/leaf-orange.png';
import leafRed from '@/assets/images/leaflet/leaf-red.png';
import leafShadow from '@/assets/images/leaflet/leaf-shadow.png';
import { useMemo, useRef, useState } from 'react';
import { LuMapPin } from 'react-icons/lu';
import PageTitle from '@/components/PageTitle';
import { BaseLayerClient, CircleClient, LayerGroupClient, LayersControlClient, MapContainerClient, MarkerClient, OverlayClient, PolygonClient, PopupClient, TileLayerClient, TooltipClient } from '@/components/client-wrapper/LeaflemMapClient';
import Loader from '@/components/Loader';
import { useLeaflet } from '@/hooks/useLeaflet';

const BasicMap = () => {
  const center: [number, number] = [42.35, -71.08];
  return <Card>
      <CardHeader className="d-block">
        <CardTitle as="h5" className="mb-1">Basic Map</CardTitle>
        <p className="text-muted mb-0">A simple Leaflet map centered with default tile layer and controls.</p>
      </CardHeader>
      <CardBody>
        <MapContainerClient center={center} zoom={10} scrollWheelZoom={false} style={{ height: '300px' }}>
          <TileLayerClient attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </MapContainerClient>
      </CardBody>
    </Card>;
};

const PopupWithMarker = () => {
  const center: [number, number] = [51.5, -0.09];
  const leaflet = useLeaflet();
  if (!leaflet) return <Loader />;
  const customIcon = leaflet.icon({ iconUrl: marketImg.src, shadowUrl: markerShadowImg.src });
  return <Card>
      <CardHeader className="d-block">
        <CardTitle as="h5" className="mb-1">Popup with Marker</CardTitle>
        <p className="text-muted mb-0">A Leaflet map with a marker that shows a popup on click.</p>
      </CardHeader>
      <CardBody>
        <MapContainerClient center={center} zoom={12} scrollWheelZoom={false} style={{ height: '300px' }}>
          <TileLayerClient attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MarkerClient icon={customIcon} position={center}>
            <PopupClient>A pretty CSS3 popup. <br /> Easily customizable.</PopupClient>
          </MarkerClient>
        </MapContainerClient>
      </CardBody>
    </Card>;
};

const TooltipWithMarker = () => {
  const center: [number, number] = [51.5, -0.09];
  const leaflet = useLeaflet();
  if (!leaflet) return <Loader />;
  const customIcon = leaflet.icon({ iconUrl: marketImg.src, shadowUrl: markerShadowImg.src });
  return <Card>
      <CardHeader className="d-block">
        <CardTitle as="h5" className="mb-1">Tooltip with Marker</CardTitle>
        <p className="text-muted mb-0">A Leaflet map with a marker that shows a tooltip on hover.</p>
      </CardHeader>
      <CardBody>
        <MapContainerClient center={center} zoom={12} scrollWheelZoom={false} style={{ height: '300px' }}>
          <TileLayerClient attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MarkerClient icon={customIcon} position={center}>
            <TooltipClient>A pretty CSS3 popup. <br /> Easily customizable.</TooltipClient>
          </MarkerClient>
        </MapContainerClient>
      </CardBody>
    </Card>;
};

const CircleAndPolygon = () => {
  const center: [number, number] = [51.5, -0.09];
  return <Card>
      <CardHeader className="d-block">
        <CardTitle as="h5" className="mb-1">Circle and Polygon</CardTitle>
        <p className="text-muted mb-0">A Leaflet map with a circle and polygon.</p>
      </CardHeader>
      <CardBody>
        <MapContainerClient center={center} zoom={12.5} scrollWheelZoom={false} style={{ height: '300px' }}>
          <TileLayerClient attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <CircleClient center={[51.508, -0.11]} pathOptions={{ color: 'red', fillColor: '#f03', fillOpacity: 0.5 }} radius={500} />
          <PolygonClient positions={[[51.509, -0.08], [51.503, -0.06], [51.51, -0.047]]} />
        </MapContainerClient>
      </CardBody>
    </Card>;
};

const DraggableMarker = () => {
  const center: [number, number] = [51.5, -0.09];
  const [position, setPosition] = useState<[number, number]>(center);
  const markerRef = useRef(null);
  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (marker !== null) {
  const latLng = (marker as any).getLatLng();
  setPosition([latLng.lat, latLng.lng]);
}
    }
  }), []);
  const leaflet = useLeaflet();
  if (!leaflet) return <Loader />;
  const customIcon = leaflet.icon({ iconUrl: marketImg.src, shadowUrl: markerShadowImg.src });
  return <Card>
      <CardHeader className="d-block">
        <CardTitle as="h5" className="mb-1">Draggable Marker</CardTitle>
        <p className="text-muted mb-0">A Leaflet map with a draggable marker.</p>
      </CardHeader>
      <CardBody>
        <MapContainerClient center={center} zoom={12} scrollWheelZoom={false} style={{ height: '300px' }}>
          <TileLayerClient attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MarkerClient icon={customIcon} position={position} draggable={true} eventHandlers={eventHandlers} ref={markerRef} />
        </MapContainerClient>
      </CardBody>
    </Card>;
};

const CustomIcon = () => {
  const center: [number, number] = [51.5, -0.09];
  const leaflet = useLeaflet();
  if (!leaflet) return <Loader />;
  const redLeaf = leaflet.icon({ iconUrl: leafRed.src, shadowUrl: leafShadow.src, iconSize: [38, 95], shadowSize: [50, 64], iconAnchor: [22, 94], shadowAnchor: [4, 62], popupAnchor: [-3, -76] });
  const greenLeaf = leaflet.icon({ iconUrl: leafGreen.src, shadowUrl: leafShadow.src, iconSize: [38, 95], shadowSize: [50, 64], iconAnchor: [22, 94], shadowAnchor: [4, 62], popupAnchor: [-3, -76] });
  const orangeLeaf = leaflet.icon({ iconUrl: leafOrange.src, shadowUrl: leafShadow.src, iconSize: [38, 95], shadowSize: [50, 64], iconAnchor: [22, 94], shadowAnchor: [4, 62], popupAnchor: [-3, -76] });
  return <Card>
      <CardHeader className="d-block">
        <CardTitle as="h5" className="mb-1">Custom Icon</CardTitle>
        <p className="text-muted mb-0">Demonstrates using custom image icons for Leaflet map markers.</p>
      </CardHeader>
      <CardBody>
        <MapContainerClient center={center} zoom={10} scrollWheelZoom={false} style={{ height: '300px' }}>
          <TileLayerClient attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MarkerClient icon={redLeaf} position={[51.5, -0.09]} />
          <MarkerClient icon={greenLeaf} position={[51.4, -0.51]} />
          <MarkerClient icon={orangeLeaf} position={[51.49, -0.45]} />
        </MapContainerClient>
      </CardBody>
    </Card>;
};

const LayerControl = () => {
  const center: [number, number] = [39.73, -104.99];
  const leaflet = useLeaflet();
  if (!leaflet) return <Loader />;
  const customIcon = leaflet.icon({ iconUrl: marketImg.src, shadowUrl: markerShadowImg.src });
  return <Card>
      <CardHeader className="d-block">
        <CardTitle as="h5" className="mb-1">Basic Map</CardTitle>
        <p className="text-muted mb-0">A simple Leaflet map centered with default tile layer and controls.</p>
      </CardHeader>
      <CardBody>
        <MapContainerClient center={center} zoom={9} scrollWheelZoom={false} style={{ height: '300px' }}>
          <LayersControlClient position="topright">
            <BaseLayerClient checked name="Street">
              <TileLayerClient url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
            </BaseLayerClient>
            <BaseLayerClient name="CartoDB Dark">
              <TileLayerClient url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://carto.com/">CARTO</a>' />
            </BaseLayerClient>
            <OverlayClient checked name="Cities">
              <LayerGroupClient>
                <MarkerClient position={[39.61, -105.02]} icon={customIcon}><PopupClient>This is Littleton, CO.</PopupClient></MarkerClient>
                <MarkerClient position={[39.74, -104.99]} icon={customIcon}><PopupClient>This is Denver, CO.</PopupClient></MarkerClient>
                <MarkerClient position={[39.73, -104.8]} icon={customIcon}><PopupClient>This is Aurora, CO.</PopupClient></MarkerClient>
                <MarkerClient position={[39.77, -105.23]} icon={customIcon}><PopupClient>This is Golden, CO.</PopupClient></MarkerClient>
              </LayerGroupClient>
            </OverlayClient>
          </LayersControlClient>
        </MapContainerClient>
      </CardBody>
    </Card>;
};

const Page = () => {
  return <Container fluid>
      <PageTitle title="Leaflet Maps Integration" subtitle="Build interactive and lightweight maps using Leaflet.js — ideal for location markers, user tracking, and geo-data visualizations." badge={{ title: 'OpenStreetMap Powered', icon: LuMapPin }} />
      <Row>
        <Col xl={6}><BasicMap /></Col>
        <Col xl={6}><PopupWithMarker /></Col>
        <Col xl={6}><TooltipWithMarker /></Col>
        <Col xl={6}><CircleAndPolygon /></Col>
        <Col xl={6}><DraggableMarker /></Col>
        <Col xl={6}><CustomIcon /></Col>
        <Col xl={6}><LayerControl /></Col>
      </Row>
    </Container>;
};

export default Page;