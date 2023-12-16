import { create } from 'zustand';
import { Codec, Policy, Resolution } from '../pages/VideoCall/type';
import { storage } from '../utils/storage';

const videoCallMeetingKey = 'VIDEO_CALL_MEETING_KEY';

type Store = {
  meeting: {
    username: string;
    meetingId: string;
    resolution: Resolution;
    policy: Policy;
    codec: Codec;
    video: boolean;
    audio: boolean;
  };
  setMeeting: (meeting: any) => void;
};

export const useMeetingStore = create<Store>()((set) => ({
  meeting: storage.get(videoCallMeetingKey) || {
    username: '',
    meetingId: '',
    resolution: '720',
    policy: 'all',
    codec: 'all',
    video: true,
    audio: true,
  },
  setMeeting: (meeting) =>
    set((state) => {
      const mergeState = { ...state.meeting, ...meeting };
      storage.set(videoCallMeetingKey, mergeState);

      return { meeting: mergeState };
    }),
}));
