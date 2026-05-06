import { useEffect, useState } from 'react';
import DataTable from 'datatables.net-react';

declare global {
  interface Window {
    $: any
    jQuery: any
  }
}

let initialized = false;

const useDataTables = (): boolean => {
  const [isDataTablesReady, setIsDataTablesReady] = useState(false);

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (!initialized) {
        const jQuery = (await import('jquery')).default;
        window.$ = jQuery;
        window.jQuery = jQuery;
        const DT = (await import('datatables.net-bs5')).default;
        await import('datatables.net-responsive');
        await import('datatables.net-select');
        DataTable.use(DT);
        initialized = true;
      }
      setIsDataTablesReady(true);
    };
    load();
  }, []);

  return isDataTablesReady;
};

export default useDataTables;