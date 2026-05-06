'use client';

import DynamicVectorMap from '@/components/DynamicVectorMap';
import { getIraqMapOptions } from '@/app/(admin)/maps/vector/data';
const IraqVectorMap = () => {
  return <DynamicVectorMap mapName="iraq" id="iraq-map" options={getIraqMapOptions()} style={{
    height: 360
  }} />;
};
export default IraqVectorMap;