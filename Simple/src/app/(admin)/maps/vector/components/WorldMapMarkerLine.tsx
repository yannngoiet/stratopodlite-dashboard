'use client';

import DynamicVectorMap from '@/components/DynamicVectorMap';
import { getWorldMarkerLineOptions } from '@/app/(admin)/maps/vector/data';
const WorldMapMarkerLine = () => {
  return <DynamicVectorMap mapName="world-merc" id="world-map-marker-line" options={getWorldMarkerLineOptions()} style={{
    height: 360
  }} />;
};
export default WorldMapMarkerLine;