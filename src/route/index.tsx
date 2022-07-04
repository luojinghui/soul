import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import App from '../pages/App';
import ChatRoom from '../pages/ChatRoom';
import { ChatHall } from '../pages/ChatHall';
import NotFound from '../pages/NotFound';
import UserCenter from '../pages/UserCenter';
import PersonCenter from '../pages/PersonCenter';

export default function Router() {
  return (
    <Suspense fallback={<div className="loading">加载中...</div>}>
      <Routes>
        <Route path="/" element={<App />} />
        {/* <Route path="/chat" element={<Navigate to="/chat/888" />}></Route> */}

        <Route path="chat">
          <Route path="" element={<ChatHall />}></Route>
          <Route path=":roomId" element={<ChatRoom />}></Route>
        </Route>

        <Route path="user">
          <Route path="" element={<PersonCenter />}></Route>
          <Route path=":userId" element={<UserCenter />}></Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
