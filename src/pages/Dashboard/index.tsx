import React from 'react';
import { Outlet } from 'react-router-dom';
import { MusicBar } from '@/components';

export default function Dashboard() {
  return (
    <>
      <div className="dashboard">
        <MusicBar />
      </div>
      <Outlet />
    </>
  );
}
