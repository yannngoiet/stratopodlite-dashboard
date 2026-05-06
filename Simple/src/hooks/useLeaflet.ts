import { useEffect, useState } from 'react';
export function useLeaflet() {
  const [leaflet, setLeaflet] = useState(null);
  useEffect(() => {
    import('leaflet').then(setLeaflet);
  }, []);
  return leaflet;
}

export default useLeaflet