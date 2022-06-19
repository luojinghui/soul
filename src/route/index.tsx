import React from 'react';
import { Routes, Route } from 'react-router-dom';

import App from '../pages/App';
import IM from '../pages/IM';

export default function Router() {
  {
    /* <div className="nav">
        <NavLink to="/" className={onActive}>
          首页
        </NavLink>
        <NavLink to="/im" className={onActive}>
          聊天室
        </NavLink>
        <div className="setting">设置</div>
      </div> */
  }
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/im" element={<IM />} />
    </Routes>
  );
}
