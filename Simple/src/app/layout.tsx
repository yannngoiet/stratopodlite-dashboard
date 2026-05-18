import AppWrapper from '@/components/AppWrapper';
import { appDescription, appTitle } from '@/helpers';
import { dmSans, ibmPlexSans, inter, jost, lato, montserrat, nunito, poppins, roboto, robotoSlab, rubik, ubuntu } from '@/helpers/fonts';
import 'leaflet/dist/leaflet.css';
import 'jsvectormap/dist/css/jsvectormap.min.css';
import 'datatables.net-buttons-bs5/css/buttons.bootstrap5.min.css';
import 'datatables.net-responsive-bs5/css/responsive.bootstrap5.min.css';
import 'datatables.net-select-bs5/css/select.bootstrap5.min.css';
import 'react-quill-new/dist/quill.core.css';
import 'react-quill-new/dist/quill.snow.css';
import 'react-quill-new/dist/quill.bubble.css';
import 'flatpickr/dist/flatpickr.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import '@/assets/scss/app.scss';

export const metadata = {
  title: {
    default: appTitle,
    template: '%s | ' + appTitle
  },
  description: appDescription,
  icons: ['/favicon.ico']
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${rubik.variable} ${inter.variable} ${nunito.variable} ${ubuntu.variable} ${jost.variable} ${roboto.variable} ${montserrat.variable} ${ibmPlexSans.variable} ${poppins.variable} ${lato.variable} ${dmSans.variable} ${robotoSlab.variable}`}>
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}