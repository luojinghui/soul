import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import App from '../pages/App';
import ChatRoom from '../pages/ChatRoom';
import { ChatHall } from '../pages/ChatHall';
import NotFound from '../pages/NotFound';
import UserCenter from '../pages/UserCenter';
import PersonCenter from '../pages/PersonCenter';
import Wrapper from '../pages/Wrapper';
import Dashboard from '../pages/Dashboard';

export default function Router() {
  return (
    <Suspense fallback={<div className="loading">加载中...</div>}>
      <Routes>
        {/* <Route path="/chat" element={<Navigate to="/chat/888" />}></Route> */}

        <Route path="/" element={<Dashboard />}>
          <Route path="" element={<App />}></Route>

          <Route path="chat">
            <Route path="" element={<ChatHall />}></Route>
            <Route path=":roomId" element={<ChatRoom />}></Route>
          </Route>

          <Route path="user">
            <Route path="" element={<PersonCenter />}></Route>
            <Route path=":userId" element={<UserCenter />}></Route>
          </Route>

          <Route path="wrapper" element={<Wrapper />}></Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
