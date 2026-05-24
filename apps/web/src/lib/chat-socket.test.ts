const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockSocket = {
  connected: false,
  connect: mockConnect,
  disconnect: mockDisconnect,
};

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket),
}));

import { connectChatSocket, disconnectChatSocket, getChatSocket } from './chat-socket';
import { io } from 'socket.io-client';

describe('chat-socket', () => {
  beforeEach(() => {
    mockSocket.connected = false;
    mockConnect.mockClear();
    mockDisconnect.mockClear();
    (io as jest.Mock).mockClear();
  });

  it('getChatSocket returns a singleton client', () => {
    const a = getChatSocket();
    const b = getChatSocket();
    expect(a).toBe(b);
    expect(io).toHaveBeenCalledTimes(1);
    expect(io).toHaveBeenCalledWith(
      expect.stringMatching(/\/chat$/),
      expect.objectContaining({ withCredentials: true, autoConnect: false }),
    );
  });

  it('connectChatSocket connects when disconnected', () => {
    const client = connectChatSocket();
    expect(client).toBe(mockSocket);
    expect(mockConnect).toHaveBeenCalled();
  });

  it('disconnectChatSocket disconnects when connected', () => {
    mockSocket.connected = true;
    disconnectChatSocket();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
