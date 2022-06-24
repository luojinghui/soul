import { Routes, Route, Navigate } from 'react-router-dom';

import App from '../pages/App';
import IM from '../pages/IM';
import NotFound from '../pages/NotFound';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/im" element={<Navigate to="/im/888" />}></Route>
      <Route path="/im/:meetingId" element={<IM />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
