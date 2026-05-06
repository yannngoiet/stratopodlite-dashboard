'use client';

import DynamicVectorMap from '@/components/DynamicVectorMap';
import { getSpainMapOptions } from '@/app/(admin)/maps/vector/data';
const SpainVectorMap = () => {
  return <DynamicVectorMap mapName="spain" id="spain-map" options={getSpainMapOptions()} style={{
    height: 360
  }} />;
};
export default SpainVectorMap;