import React, { useState, useEffect, useRef } from 'react';
import { TeamData } from '../types/game';
import { Globe, Users, Copy, Check, Play, X, Loader2, Wifi, WifiOff } from 'lucide-react';

interface FriendMatchModalProps {
  userTeam: TeamData;
  onStartOnlineMatch: (role: 'host' | 'guest', roomId: string, remoteTeam: TeamData) => void;
  onClose: () => void;
}

export const FriendMatchModal: React.FC<FriendMatchModalProps> = ({
  userTeam,
  onStartOnlineMatch,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'waiting' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remoteTeam, setRemoteTeam] = useState<TeamData | null>(null);
  const [copied, setCopied] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket server on current host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus('idle');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'room_created') {
          setRoomId(msg.roomId);
          setConnectionStatus('waiting');
        } else if (msg.type === 'room_joined') {
          setRoomId(msg.roomId);
          setRemoteTeam(msg.hostTeam);
          setConnectionStatus('ready');
        } else if (msg.type === 'guest_joined') {
          setRemoteTeam(msg.guestTeam);
          setConnectionStatus('ready');
        } else if (msg.type === 'error') {
          setErrorMessage(msg.message);
          setConnectionStatus('error');
        }
      } catch {}
    };

    ws.onerror = () => {
      setConnectionStatus('error');
      setErrorMessage('Serverga ulanishda xatolik yuz berdi (WebSocket error)');
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleCreateRoom = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setErrorMessage('Server bilan aloqa yo\'q');
      return;
    }
    setConnectionStatus('connecting');
    wsRef.current.send(JSON.stringify({
      type: 'create_room',
      team: userTeam,
    }));
  };

  const handleJoinRoom = () => {
    if (!inputCode.trim() || inputCode.length < 5) {
      setErrorMessage('To\'g\'ri 6 xonali kod kiriting');
      return;
    }
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setErrorMessage('Server bilan aloqa yo\'q');
      return;
    }
    setConnectionStatus('connecting');
    wsRef.current.send(JSON.stringify({
      type: 'join_room',
      roomId: inputCode.trim(),
      team: userTeam,
    }));
  };

  const handleCopyCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleLaunchMatch = () => {
    if (connectionStatus === 'ready' && roomId && remoteTeam) {
      onStartOnlineMatch(activeTab === 'create' ? 'host' : 'guest', roomId, remoteTeam);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-sky-400" />
            <h2 className="font-athletic text-2xl font-black uppercase tracking-wider text-white">
              Friend Match · Masofadan O&apos;ynash
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-2">
          <button
            onClick={() => { setActiveTab('create'); setConnectionStatus('idle'); setRoomId(null); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'create' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            O&apos;yin Yaratish (Host)
          </button>
          <button
            onClick={() => { setActiveTab('join'); setConnectionStatus('idle'); setRoomId(null); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'join' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            O&apos;yinga Ulanish (Join)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-xs text-rose-300 font-semibold text-center">
              {errorMessage}
            </div>
          )}

          {/* Create Match Tab */}
          {activeTab === 'create' && (
            <div className="flex flex-col items-center gap-4 text-center">
              {!roomId ? (
                <>
                  <p className="text-xs text-slate-300">
                    O&apos;yin xonasi yaratilgach, berilgan 6 xonali kodni do&apos;stingizga yuboring. U kiritishi bilanoq match boshlanadi!
                  </p>
                  <button
                    onClick={handleCreateRoom}
                    disabled={connectionStatus === 'connecting'}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-xl transition-all"
                  >
                    {connectionStatus === 'connecting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>Xona Yaratish (Create Room)</span>
                  </button>
                </>
              ) : (
                <div className="w-full flex flex-col items-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
                    O&apos;yin Kodingiz:
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="px-6 py-2.5 rounded-xl bg-slate-950 font-mono-numbers text-3xl font-black text-white tracking-widest border border-sky-400 shadow-inner">
                      {roomId}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-colors shadow"
                      title="Nusxalash"
                    >
                      {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>

                  {connectionStatus === 'waiting' && (
                    <div className="flex items-center gap-2 text-xs text-amber-400 animate-pulse mt-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Do&apos;stingiz ulanishini kutmoqda...</span>
                    </div>
                  )}

                  {connectionStatus === 'ready' && remoteTeam && (
                    <div className="w-full p-4 rounded-xl bg-emerald-950/60 border border-emerald-500 flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3">
                        <Wifi className="w-5 h-5 text-emerald-400" />
                        <div className="text-left">
                          <span className="text-xs font-bold text-emerald-300">Do&apos;stingiz ulandi!</span>
                          <h4 className="text-sm font-black text-white">{remoteTeam.name}</h4>
                        </div>
                      </div>
                      <button
                        onClick={handleLaunchMatch}
                        className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95"
                      >
                        Matchni Boshlash
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Join Match Tab */}
          {activeTab === 'join' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-xs text-slate-300">
                Do&apos;stingiz yaratgan 6 xonali o&apos;yin kodini kiriting:
              </p>
              <input
                type="text"
                placeholder="Kod, masalan: 849201"
                value={inputCode}
                onChange={e => setInputCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-48 text-center px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono-numbers text-2xl font-black tracking-widest focus:outline-none focus:border-sky-500"
              />

              {connectionStatus !== 'ready' ? (
                <button
                  onClick={handleJoinRoom}
                  disabled={inputCode.length < 5 || connectionStatus === 'connecting'}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm shadow-xl transition-all"
                >
                  {connectionStatus === 'connecting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>O&apos;yinga Ulanish (Join)</span>
                </button>
              ) : (
                <div className="w-full p-4 rounded-xl bg-emerald-950/60 border border-emerald-500 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-emerald-400" />
                    <div className="text-left">
                      <span className="text-xs font-bold text-emerald-300">Xonaga muvaffaqiyatli ulandingiz!</span>
                      <h4 className="text-sm font-black text-white">{remoteTeam?.name}</h4>
                    </div>
                  </div>
                  <button
                    onClick={handleLaunchMatch}
                    className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95"
                  >
                    Tayyor (Start)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
