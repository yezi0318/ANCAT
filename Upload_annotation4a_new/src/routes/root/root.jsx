import { Outlet } from 'react-router-dom';
import './root.css';

export default function Root() {
  return (
    <>
      <div>
        <Outlet />
      </div>
    </>
  );
}
