'use client';

import dynamic from 'next/dynamic';
const MapContainerClient = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), {
  ssr: false
});
const CircleClient = dynamic(() => import('react-leaflet').then(mod => mod.Circle), {
  ssr: false
});
const LayerGroupClient = dynamic(() => import('react-leaflet').then(mod => mod.LayerGroup), {
  ssr: false
});
const LayersControlClient = dynamic(() => import('react-leaflet').then(mod => mod.LayersControl), {
  ssr: false
});
const MarkerClient = dynamic(() => import('react-leaflet').then(mod => mod.Marker), {
  ssr: false
});
const PolygonClient = dynamic(() => import('react-leaflet').then(mod => mod.Polygon), {
  ssr: false
});
const TileLayerClient = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), {
  ssr: false
});
const PopupClient = dynamic(() => import('react-leaflet').then(mod => mod.Popup), {
  ssr: false
});
const TooltipClient = dynamic(() => import('react-leaflet').then(mod => mod.Tooltip), {
  ssr: false
});
const BaseLayerClient = dynamic(() => import('react-leaflet').then(mod => mod.LayersControl.BaseLayer), {
  ssr: false
});
const OverlayClient = dynamic(() => import('react-leaflet').then(mod => mod.LayersControl.Overlay), {
  ssr: false
});
export { MapContainerClient, TileLayerClient, LayersControlClient, LayerGroupClient, MarkerClient, CircleClient, PolygonClient, PopupClient, TooltipClient, BaseLayerClient, OverlayClient };