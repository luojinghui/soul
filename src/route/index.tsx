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
import MusicHall from '../pages/Music/MusicHall';
import { VideoCall } from '../pages/VideoCall';

export default function Router() {
  return (
    <Suspense fallback={<div className="loading">加载中...</div>}>
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route path="" element={<App />}></Route>

          <Route path="chat">
            <Route path="" element={<ChatHall />}></Route>
            <Route path=":roomId" element={<ChatRoom />}></Route>
          </Route>

          <Route path="video">
            <Route path="" element={<VideoCall />}></Route>
          </Route>

          <Route path="user">
            <Route path="" element={<PersonCenter />}></Route>
            <Route path=":userId" element={<UserCenter />}></Route>
          </Route>

          <Route path="wrapper" element={<Wrapper />}></Route>

          <Route path="music">
            <Route path="" element={<MusicHall />}></Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
