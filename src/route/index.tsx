import { Routes, Route } from 'react-router-dom';

import App from '../pages/App';
import IM from '../pages/IM';
import { IMRoom } from '../pages/IMRoom';
import NotFound from '../pages/NotFound';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      {/* <Route path="/chat" element={<Navigate to="/chat/888" />}></Route> */}

      <Route path="chat">
        <Route path="" element={<IMRoom />}></Route>
        <Route path=":roomId" element={<IM />}></Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
