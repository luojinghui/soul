import { Routes, Route, Navigate } from 'react-router-dom';

import App from '../pages/App';
import IM from '../pages/IM';
import NotFound from '../pages/NotFound';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/chat" element={<Navigate to="/chat/888" />}></Route>
      <Route path="/chat/:roomId" element={<IM />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
