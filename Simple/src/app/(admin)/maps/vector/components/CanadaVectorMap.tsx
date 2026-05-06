'use client';

import DynamicVectorMap from '@/components/DynamicVectorMap';
import { getCanadaMapOptions } from '@/app/(admin)/maps/vector/data';
const CanadaVectorMap = () => {
  return <DynamicVectorMap mapName="canada" id="canada-map" options={getCanadaMapOptions()} style={{
    height: 360
  }} />;
};
export default CanadaVectorMap;