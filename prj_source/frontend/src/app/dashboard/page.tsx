"use client";

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { useRealtime } from '@/hooks/useRealtime'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  MessageCircle,
  Heart,
  Zap,
  AlertTriangle,
  Edit2,
  Clock,
  Inbox,
  Music,
  Trophy,
  Menu,
  Loader
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase'
import { updateNickname } from '@/app/actions/nickname'
import Link from 'next/link'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'

// --- 컴포넌트: 카운트다운 타이머 (T025) ---
function CountdownTimer({ targetDate }: { targetDate: string | Date }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        setTimeLeft("파티 종료");
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-2 bg-rose-500/10 px-4 py-2 rounded-2xl border border-rose-500/20 text-rose-500">
      <Clock className="w-4 h-4 animate-pulse" />
      <span className="font-mono font-bold text-lg">{timeLeft || "--:--:--"}</span>
    </div>
  );
}

// --- 컴포넌트: 쪽지 보관함 (T025) ---
interface MessageItem {
  id: string
  content: string
  is_read: number
  created_at: string
}

function MessageInbox({ messages, onRead }: { messages: MessageItem[], onRead: (id: string) => void }) {
  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
      {messages.length === 0 ? (
        <div className="text-center py-12 opacity-30">
          <Inbox className="w-12 h-12 mx-auto mb-2" />
          <p>받은 쪽지가 없습니다.</p>
        </div>
      ) : (
        messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`p-4 rounded-xl border transition-all ${msg.is_read ? 'bg-white/5 border-white/5' : 'bg-indigo-500/10 border-indigo-500/30'}`}
            onClick={() => !msg.is_read && onRead(msg.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">익명 쪽지</span>
              <span className="text-[10px] text-zinc-500">{new Date(msg.created_at).toLocaleTimeString()}</span>
            </div>
            <p className="text-sm leading-relaxed">{msg.content}</p>
            {!msg.is_read && (
              <div className="mt-2 flex justify-end">
                <Badge variant="secondary" className="text-[8px] bg-indigo-500/20 text-indigo-400">NEW</Badge>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// --- 메인 페이지 ---
interface ParticipantInfo {
  id: string
  nickname: string | null
  last_active: string | null
}

interface MyProfile {
  id: string
  nickname: string
  nickname_change_count: number
  party_id: string
  [key: string]: unknown
}

interface PartyInfo {
  name: string
  start_at: string | null
  end_at: string | null
  [key: string]: unknown
}

interface InteractionLimits {
  hearts: number
  cupids: number
  messages: number
}

interface NicknameHistoryItem {
  id: string
  old_nickname: string | null
  new_nickname: string
  created_at: string
}

interface AnnouncementData {
  content: string
  type: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useAuth()
  const { participant, setParticipant } = useStore()
  const [isRestoringSession, setIsRestoringSession] = useState(true)

  useRealtime(participant?.id)

  const [participants, setParticipants] = useState<ParticipantInfo[]>([])
  const [stats, setStats] = useState({ messages: 0, cupid: 0, likes: 0 })
  const [sentStats, setSentStats] = useState({ hearts: 0, cupids: 0, messages: 0 })
  const [interactionLimits, setInteractionLimits] = useState<InteractionLimits>({ hearts: 3, cupids: 2, messages: 20 })
  const [myMessages, setMyMessages] = useState<MessageItem[]>([])
  const [myProfile, setMyProfile] = useState<MyProfile | null>(null);
  const [partyInfo, setPartyInfo] = useState<PartyInfo | null>(null);

  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isNicknameDialogOpen, setIsNicknameDialogOpen] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [nicknameHistory, setNicknameHistory] = useState<NicknameHistoryItem[]>([]);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [totalParticipants, setTotalParticipants] = useState<number>(0);
  const [announcementPopup, setAnnouncementPopup] = useState<AnnouncementData | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<{ id: string; nickname: string } | null>(null);
  const [isInteractionOpen, setIsInteractionOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const supabase = createClient()

  // ✓ Step 1: 세션 복구 (새로고침 후 participant 자동 복구)
  useEffect(() => {
    const restoreParticipant = async () => {
      if (!sessionLoading && user?.id) {
        try {
          // anonymous_id로 participant 조회
          const { data, error } = await supabase
            .from('participants')
            .select('*')
            .eq('anonymous_id', user.id)
            .single()

          if (data && !error) {
            // useStore에 복구
            setParticipant({
              id: data.id,
              nickname: data.nickname || '닉네임 없음',
              nicknameChangeCount: data.nickname_change_count || 0
            })
          }
        } catch (err) {
          console.error('세션 복구 실패:', err)
        }
      }
      setIsRestoringSession(false)
    }

    restoreParticipant()
  }, [user, sessionLoading, supabase, setParticipant])

  // ✓ Step 2: 인증 확인 (로그인 상태 아니면 랜딩 페이지로 리디렉트)
  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/')
      return
    }
  }, [user, sessionLoading, router])

  const fetchData = useCallback(async () => {
    // ✓ participant 복구 완료 & 세션 유효할 때만 실행
    if (!participant?.id || !user?.id || isRestoringSession) return;

    // 1. 시스템 설정 (interaction limits)
    const { data: limitsData } = await supabase.from('system_settings').select('value').eq('key', 'interaction_limits').maybeSingle();
    if (limitsData?.value) {
      setInteractionLimits(limitsData.value);
    }

    // 2. 내 프로필 및 참여자 목록
    const { data: me } = await supabase.from('participants').select('*').eq('id', participant.id).single();
    if (me) {
      setMyProfile(me);
      // 파티 정보 (타이머용)
      if (me.party_id) {
        const { data: party } = await supabase.from('parties').select('*').eq('id', me.party_id).single();
        setPartyInfo(party);
      }
    }

    const { data: others, count } = await supabase.from('participants')
      .select('id, nickname, last_active', { count: 'exact' })
      .neq('id', participant.id)
      .order('last_active', { ascending: false })
      .limit(40);

    setParticipants(others || []);
    setTotalParticipants((count || 0) + 1); // 본인 포함 총 인원

    // 3. 스탯 및 쪽지 보관함
    const { data: msgs } = await supabase.from('messages').select('*').eq('receiver_id', participant.id).order('created_at', { ascending: false });
    setMyMessages(msgs || []);

    const { count: cCount } = await supabase.from('interactions').select('*', { count: 'exact', head: true }).eq('receiver_id', participant.id).eq('type', 'heart');
    const { count: lCount } = await supabase.from('interactions').select('*', { count: 'exact', head: true }).eq('receiver_id', participant.id).eq('type', 'cupid');

    setStats({
      messages: msgs?.length || 0,
      cupid: cCount || 0,
      likes: lCount || 0
    });

    const { count: sentHearts } = await supabase.from('interactions').select('*', { count: 'exact', head: true }).eq('sender_id', participant.id).eq('type', 'heart');
    const { count: sentCupids } = await supabase.from('interactions').select('*', { count: 'exact', head: true }).eq('sender_id', participant.id).eq('type', 'cupid');
    const { count: sentMsgs } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('sender_id', participant.id);

    setSentStats({ hearts: sentHearts || 0, cupids: sentCupids || 0, messages: sentMsgs || 0 });
  }, [participant, user, isRestoringSession, supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Supabase Realtime 구독 패턴: 최초 로드 후 실시간 업데이트 수신
    fetchData();
    const channel = supabase.channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        fetchData();
        if (payload.eventType === 'INSERT' && (payload.new as { receiver_id: string }).receiver_id === participant?.id) {
          toast('새로운 쪽지가 도착했습니다! 📩');
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interactions' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, (payload) => {
        setAnnouncementPopup(payload.new as AnnouncementData);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); }
  }, [participant?.id, fetchData, supabase]);

  const handleReadMessage = async (msgId: string) => {
    await fetch(`/api/messages/${msgId}/read`, { method: 'PATCH' });
    fetchData();
  };

  // 기존 핸들러들 (SOS, Interaction 등) 유지 및 보완...
  const handleSOS = async (msg: string) => {
    if (!myProfile || !participant?.id) return;
    const { error } = await supabase.from('alerts').insert({
      participant_id: participant.id,
      type: 'SOS',
      message: `🚨 SOS (${myProfile.nickname}): ${msg}`,
      resolved: false
    });
    if (!error) toast.success('관리자에게 SOS 요청이 전송되었습니다!');
    setIsSosOpen(false);
  };

  const handleMusicRequest = async (song: string) => {
    if (!song.trim() || !participant?.id) return;
    const { error } = await supabase.from('alerts').insert({
      participant_id: participant.id,
      type: 'MUSIC',
      message: `🎵 노래신청 (${myProfile?.nickname}): ${song}`,
      resolved: false
    });
    if (!error) toast.success('노래 신청이 접수되었습니다! 🎵');
    setIsMusicOpen(false);
  };

  const fetchNicknameHistory = async () => {
    if (!participant?.id) return;
    const { data } = await supabase
      .from('nickname_history')
      .select('*')
      .eq('participant_id', participant.id)
      .order('created_at', { ascending: false });
    setNicknameHistory(data || []);
  };

  const handleNicknameUpdate = async () => {
    if (!participant?.id || !newNickname.trim() || newNickname === myProfile?.nickname) return;

    const result = await updateNickname(participant.id, newNickname.trim());

    if (result.success) {
      setParticipant({ ...participant, nickname: newNickname.trim() });
      toast.success('닉네임이 변경되었습니다.');
      setIsNicknameDialogOpen(false);
      fetchData();
    } else {
      toast.error(result.error || '닉네임 변경 실패');
    }
  };

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendHeart = async () => {
    if (!selectedTarget || !myProfile) return;
    if (sentStats.hearts >= interactionLimits.hearts) {
      toast.error('호감 발송 한도를 초과했습니다.');
      return;
    }
    const { error } = await supabase.from('interactions').insert({
      sender_id: myProfile.id,
      receiver_id: selectedTarget.id,
      party_id: myProfile.party_id,
      type: 'heart'
    });
    if (!error) {
      toast.success(`${selectedTarget.nickname}님에게 호감을 보냈습니다! 💕`);
    } else {
      toast.error('이미 호감을 보냈거나 전송에 실패했습니다.');
    }
    setIsInteractionOpen(false);
    setSelectedTarget(null);
  };

  const handleSendCupid = async () => {
    if (!selectedTarget || !myProfile) return;
    if (sentStats.cupids >= interactionLimits.cupids) {
      toast.error('큐피트 발송 한도를 초과했습니다.');
      return;
    }
    const { error } = await supabase.from('interactions').insert({
      sender_id: myProfile.id,
      receiver_id: selectedTarget.id,
      party_id: myProfile.party_id,
      type: 'cupid'
    });
    if (!error) {
      toast.success(`${selectedTarget.nickname}님에게 큐피트를 보냈습니다! 💘`);
    } else {
      toast.error('이미 큐피트를 보냈거나 전송에 실패했습니다.');
    }
    setIsInteractionOpen(false);
    setSelectedTarget(null);
  };

  const handleSendMessage = async () => {
    if (!selectedTarget || !myProfile || !messageContent.trim()) return;
    if (sentStats.messages >= interactionLimits.messages) {
      toast.error('쪽지 발송 한도를 초과했습니다.');
      return;
    }
    const { error } = await supabase.from('messages').insert({
      sender_id: myProfile.id,
      receiver_id: selectedTarget.id,
      party_id: myProfile.party_id,
      content: messageContent.trim()
    });
    if (!error) {
      toast.success(`${selectedTarget.nickname}님에게 쪽지를 보냈습니다! 📩`);
      setMessageContent('');
    } else {
      toast.error('쪽지 전송에 실패했습니다.');
    }
    setIsInteractionOpen(false);
    setSelectedTarget(null);
  };

  const openInteraction = (p: { id: string; nickname: string }) => {
    setSelectedTarget(p);
    setMessageContent('');
    setIsInteractionOpen(true);
  };

  // ✓ Step 3: 로딩 상태 표시
  if (sessionLoading || isRestoringSession) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4">
        <Loader className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-zinc-400">사용자 정보 복구 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-500" />
      
      <div className="w-full max-w-md mx-auto space-y-8 pt-8">
        {/* 상단: 프로필 & 타이머 */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-black tracking-tighter">DASHBOARD</h1>
              <div className="mt-1 flex flex-col gap-1">
                <p className="text-emerald-400 text-sm font-bold tracking-widest">{partyInfo?.name}</p>
                {(partyInfo?.start_at || partyInfo?.end_at) && (
                  <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">
                    {formatTime(partyInfo?.start_at)} ~ {formatTime(partyInfo?.end_at)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {partyInfo?.end_at && <CountdownTimer targetDate={partyInfo.end_at} />}
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="rounded-full hover:bg-white/10 h-10 w-10">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <button
            onClick={() => {
              setNewNickname(myProfile?.nickname || '');
              fetchNicknameHistory();
              setIsNicknameDialogOpen(true);
            }}
            className="flex items-center gap-3 glass px-4 py-3 rounded-2xl w-full hover:bg-white/10 active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-lg shrink-0">
              {myProfile?.nickname?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-lg font-bold truncate">{myProfile?.nickname || '닉네임 없음'}</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                수정 가능 {3 - (myProfile?.nickname_change_count || 0)}회 남음
              </p>
            </div>
            <Edit2 className="w-4 h-4 text-zinc-500 shrink-0" />
          </button>
        </div>

        {/* 스탯 카드 */}
        <div className="grid grid-cols-3 gap-3">
          <Dialog open={isInboxOpen} onOpenChange={setIsInboxOpen}>
            <DialogTrigger>
              <Card className="glass border-none text-center p-4 cursor-pointer hover:bg-white/10 active:scale-95 transition-all">
                <MessageCircle className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
                <p className="text-lg font-bold">{stats.messages}</p>
                <p className="text-[9px] uppercase opacity-40">Inbox</p>
                <p className="text-[8px] text-indigo-400/60 mt-1">발송가능 {Math.max(0, interactionLimits.messages - sentStats.messages)}회</p>
              </Card>
            </DialogTrigger>
            <DialogContent className="glass border-none max-w-[90%] rounded-3xl">
              <DialogHeader><DialogTitle>쪽지 보관함</DialogTitle></DialogHeader>
              <MessageInbox messages={myMessages} onRead={handleReadMessage} />
            </DialogContent>
          </Dialog>
          <Card className="glass border-none text-center p-4">
            <Heart className="w-6 h-6 mx-auto mb-2 text-rose-500" />
            <p className="text-lg font-bold">{stats.likes}</p>
            <p className="text-[9px] uppercase opacity-40">Hearts</p>
            <p className="text-[8px] text-rose-400/60 mt-1">발송가능 {Math.max(0, interactionLimits.hearts - sentStats.hearts)}회</p>
          </Card>
          <Card className="glass border-none text-center p-4">
            <Zap className="w-6 h-6 mx-auto mb-2 text-amber-500" />
            <p className="text-lg font-bold">{stats.cupid}</p>
            <p className="text-[9px] uppercase opacity-40">Cupids</p>
            <p className="text-[8px] text-amber-400/60 mt-1">발송가능 {Math.max(0, interactionLimits.cupids - sentStats.cupids)}회</p>
          </Card>
        </div>

        {/* 참여자 목록 등 나머지 UI (간소화) */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            Active Participants
            <span className="ml-auto bg-white/10 px-2 py-0.5 rounded-full text-xs text-white/80 font-mono">
              {totalParticipants}명
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {participants.map(p => (
              <div key={p.id} className="glass p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => openInteraction({ id: p.id, nickname: p.nickname || '?' })}>
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xl">{p.nickname?.[0] || '?'}</div>
                <span className="text-sm font-bold">{p.nickname}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 탭 바 - 랭킹 페이지 나의순위 스타일 적용 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-white/10 z-40">
        <div className="max-w-md mx-auto flex justify-center gap-3">
          <Button 
            className="flex-1 rounded-2xl btn-glass-sos h-14 font-bold flex flex-col gap-1 items-center justify-center p-0" 
            onClick={() => setIsSosOpen(true)}
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="text-[10px] tracking-widest uppercase">SOS</span>
          </Button>
          
          <Button 
            className="flex-1 rounded-2xl btn-glass-music h-14 font-bold flex flex-col gap-1 items-center justify-center p-0" 
            onClick={() => setIsMusicOpen(true)}
          >
            <Music className="w-5 h-5" />
            <span className="text-[10px] tracking-widest uppercase">MUSIC</span>
          </Button>

          <Link href="/ranking" className="flex-1">
            <Button className="w-full rounded-2xl btn-glass-rank h-14 font-bold flex flex-col gap-1 items-center justify-center p-0">
              <Trophy className="w-5 h-5" />
              <span className="text-[10px] tracking-widest uppercase">RANK</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* SOS 다이얼로그 */}
      <Dialog open={isSosOpen} onOpenChange={setIsSosOpen}>
        <DialogContent className="glass border-white/10 max-w-[90%] rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-black text-rose-500 flex items-center gap-2"><AlertTriangle className="w-6 h-6"/> 관리자 호출 (SOS)</DialogTitle></DialogHeader>
          <p className="text-sm text-zinc-400 mb-2">어떤 문제가 발생했나요? 관리자가 곧 확인합니다.</p>
          <Textarea id="sos-message" placeholder="도움이 필요한 내용을 적어주세요..." className="bg-white/5 border-white/10 text-white rounded-xl resize-none h-24 mb-4" />
          <Button onClick={() => {
            const msg = (document.getElementById('sos-message') as HTMLTextAreaElement).value;
            handleSOS(msg);
          }} className="w-full btn-glass-sos font-bold h-14 rounded-2xl text-lg">SOS 보내기</Button>
        </DialogContent>
      </Dialog>

      {/* 노래 신청 다이얼로그 */}
      <Dialog open={isMusicOpen} onOpenChange={setIsMusicOpen}>
        <DialogContent className="glass border-white/10 max-w-[90%] rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-black text-cyan-400 flex items-center gap-2"><Music className="w-6 h-6"/> 노래 신청하기</DialogTitle></DialogHeader>
          <p className="text-sm text-zinc-400 mb-2">듣고 싶은 노래의 제목과 가수를 적어주세요.</p>
          <Input id="music-input" placeholder="예: 뉴진스 - Hype Boy" className="bg-white/5 border-white/10 text-white h-14 rounded-xl mb-4" />
          <Button onClick={() => {
            const song = (document.getElementById('music-input') as HTMLInputElement).value;
            handleMusicRequest(song);
          }} className="w-full btn-glass-music font-bold h-14 rounded-2xl text-lg">신청하기</Button>
        </DialogContent>
      </Dialog>

      {/* 닉네임 수정 다이얼로그 */}
      <Dialog open={isNicknameDialogOpen} onOpenChange={setIsNicknameDialogOpen}>
        <DialogContent className="glass border-white/10 max-w-[90%] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-indigo-400 flex items-center gap-2">
              <Edit2 className="w-6 h-6" /> 닉네임 수정
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2">
                남은 변경 횟수: {3 - (myProfile?.nickname_change_count || 0)} / 3
              </p>
              <Input
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                placeholder="새 닉네임 입력"
                maxLength={12}
                className="bg-white/5 border-white/10 text-white h-14 rounded-xl text-lg"
              />
            </div>
            <Button
              onClick={handleNicknameUpdate}
              disabled={
                !newNickname.trim() ||
                newNickname === myProfile?.nickname ||
                (myProfile?.nickname_change_count || 0) >= 3
              }
              className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold h-14 rounded-2xl text-lg"
            >
              변경하기
            </Button>

            {nicknameHistory.length > 0 && (
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-3">변경 이력</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {nicknameHistory.map((h) => (
                    <div key={h.id} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-white/5">
                      <span className="text-zinc-500 line-through">{h.old_nickname}</span>
                      <span className="text-zinc-600">→</span>
                      <span className="text-indigo-400 font-bold">{h.new_nickname}</span>
                      <span className="ml-auto text-[10px] text-zinc-600">
                        {new Date(h.created_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 참여자 상호작용 다이얼로그 */}
      <Dialog open={isInteractionOpen} onOpenChange={setIsInteractionOpen}>
        <DialogContent className="glass border-white/10 max-w-[90%] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm">
                {selectedTarget?.nickname?.[0] || '?'}
              </div>
              {selectedTarget?.nickname}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleSendHeart}
                className="h-20 flex flex-col gap-1 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30 transition-all"
              >
                <Heart className="w-6 h-6" />
                <span className="text-xs font-bold">호감 보내기</span>
              </Button>
              <Button
                onClick={handleSendCupid}
                className="h-20 flex flex-col gap-1 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-all"
              >
                <Zap className="w-6 h-6" />
                <span className="text-xs font-bold">큐피트 보내기</span>
              </Button>
            </div>
            <div className="space-y-3">
              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="익명 쪽지를 작성하세요..."
                className="bg-white/5 border-white/10 text-white rounded-xl resize-none h-24"
                maxLength={200}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageContent.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold h-12 rounded-2xl text-base"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                쪽지 보내기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 공지사항 팝업 */}
      <Dialog open={!!announcementPopup} onOpenChange={() => setAnnouncementPopup(null)}>
        <DialogContent className="glass border-white/10 max-w-[90%] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              {announcementPopup?.type === 'emergency' ? (
                <><AlertTriangle className="w-6 h-6 text-rose-500" /> 긴급 공지</>
              ) : (
                <><MessageCircle className="w-6 h-6 text-indigo-400" /> 공지사항</>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-lg leading-relaxed font-medium">{announcementPopup?.content}</p>
            <p className="text-xs text-zinc-500 mt-4">
              {announcementPopup?.created_at && new Date(announcementPopup.created_at).toLocaleString('ko-KR')}
            </p>
          </div>
          <Button
            onClick={() => setAnnouncementPopup(null)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold h-14 rounded-2xl text-lg"
          >
            확인
          </Button>
        </DialogContent>
      </Dialog>

      {/* 우측 사이드바 */}
      {participant?.id && (
        <DashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          participantId={participant.id}
        />
      )}
    </div>
  )
}
