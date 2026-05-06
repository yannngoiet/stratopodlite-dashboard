'use client';

import DynamicVectorMap from '@/components/DynamicVectorMap';
import { getUSAMapOptions } from '@/app/(admin)/maps/vector/data';
const USAVectorMap = () => {
  return <DynamicVectorMap mapName="us-aea-en" id="usa-map" options={getUSAMapOptions()} style={{
    height: 360
  }} />;
};
export default USAVectorMap;