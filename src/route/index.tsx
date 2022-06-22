import { Routes, Route } from 'react-router-dom';

import App from '../pages/App';
import IM from '../pages/IM';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/im" element={<IM />} />
    </Routes>
  );
}
