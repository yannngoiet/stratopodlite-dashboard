'use client';

import { useEffect } from 'react';
import 'jsvectormap/dist/css/jsvectormap.css';

interface DynamicVectorMapProps {
  id: string
  mapName: string
  options?: Record<string, any>
  [key: string]: any
}

declare global {
  interface Window {
    jsVectorMap: any
  }
}

const DynamicVectorMap = ({
  id,
  mapName,
  options = {},
  ...props
}: DynamicVectorMapProps) => {
  useEffect(() => {
    let instance: any;
    const load = async () => {
      const jsvectormap = (await import('jsvectormap')).default;
      if (!window.jsVectorMap) {
        window.jsVectorMap = jsvectormap;
      }
      await import(`jsvectormap/dist/maps/${mapName}`);
      instance = new jsvectormap({
        selector: `#${id}`,
        map: mapName,
        ...options
      });
    };
    load();
    return () => {
      instance?.destroy?.();
    };
  }, [id, mapName, options]);

  return <div id={id} {...props} />;
};

export default DynamicVectorMap;