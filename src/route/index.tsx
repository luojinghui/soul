import React from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';

import App from '../pages/App';
import IM from '../pages/IM';

export default function Router() {
  const onActive = ({ isActive }: any) => (isActive ? 'item active' : 'item');

  return (
    <div>
      <div className="nav">
        <NavLink to="/" className={onActive}>
          首页
        </NavLink>
        <NavLink to="/im" className={onActive}>
          聊天室
        </NavLink>
      </div>

      <h1>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/im" element={<IM />} />
        </Routes>
      </h1>
    </div>
  );
}
