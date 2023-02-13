import React from 'react';
import { Outlet } from 'react-router-dom';
import { MusicBar, Login } from '@/components';

export default function Dashboard() {
  return (
    <>
      <div className="dashboard">
        <MusicBar />
        <Login />
      </div>
      <Outlet />
    </>
  );
}
