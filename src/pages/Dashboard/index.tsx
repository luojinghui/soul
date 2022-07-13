import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

export default function Dashboard() {
  useEffect(() => {}, []);

  return (
    <>
      <div></div>

      <Outlet />
    </>
  );
}
