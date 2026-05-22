import Link from 'next/link';
import { LuTruck } from 'react-icons/lu';
import { appName } from '@/helpers';
const AppLogo = () => {
  return <>
      <Link href="/" className="logo-dark">
        <span className="d-flex justify-content-start align-items-center gap-1">
          <span className="avatar avatar-xs rounded-circle text-bg-dark">
            <span className="avatar-title">
              <LuTruck className="fs-md" />
            </span>
          </span>
          <span className="logo-text text-body fw-bold fs-xl">{appName}</span>
        </span>
      </Link>
      <Link href="/" className="logo-light">
        <span className="d-flex justify-content-start align-items-center gap-1">
          <span className="avatar avatar-xs rounded-circle text-bg-dark">
            <span className="avatar-title">
              <LuTruck className="fs-md" />
            </span>
          </span>
          <span className="logo-text text-white fw-bold fs-xl">{appName}</span>
        </span>
      </Link>
    </>;
};
export default AppLogo;