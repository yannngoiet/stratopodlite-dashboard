'use client';

import DynamicVectorMap from '@/components/DynamicVectorMap';
import { getRussiaMapOptions } from '@/app/(admin)/maps/vector/data';
const RussiaVectorMap = () => {
  return <DynamicVectorMap mapName="russia" id="russia-map" options={getRussiaMapOptions()} style={{
    height: 360
  }} />;
};
export default RussiaVectorMap;