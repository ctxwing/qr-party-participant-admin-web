"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Bell, 
  BellOff, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  Zap, 
  MessageSquare, 
  Heart, 
  UserRound, 
  Megaphone,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";

export default function AdminMonitoringPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [latency, setLatency] = useState<number | null>(null);
  const supabase = createClient();
  const lastUpdateRef = useRef<number>(Date.now());

  // 데이터 로드
  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/admin/activities");
      const result = await res.json();
      if (res.ok) {
        setActivities(result.data || []);
      }
    } catch (err) {
      console.error("데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  // 실시간 구독 설정
  useEffect(() => {
    fetchActivities();

    const interactionChannel = supabase
      .channel('admin-monitoring')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'interactions' }, (payload) => {
        handleNewActivity({ ...payload.new, category: "interaction" });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        handleNewActivity({ ...payload.new, category: "message" });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nickname_logs' }, (payload) => {
        handleNewActivity({ ...payload.new, category: "nickname" });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, (payload) => {
        handleNewActivity({ ...payload.new, category: "announcement" });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(interactionChannel);
    };
  }, []);

  const handleNewActivity = (newAct: any) => {
    // Latency 계산 (sent_at 페이로드가 있다고 가정하거나 현재 시간과 비교)
    const now = Date.now();
    const sentAt = newAct.created_at ? new Date(newAct.created_at).getTime() : now;
    const diff = now - sentAt;
    setLatency(diff > 0 ? diff : 0);
    
    setActivities(prev => [newAct, ...prev].slice(0, 100));
    
    if (newAct.category === "announcement" || (newAct.category === "interaction" && newAct.type === "cupid")) {
      playAlertSound();
    }
  };

  const playAlertSound = () => {
    if (!soundEnabled) return;
    const audio = new Audio("/alert-chime.mp3");
    audio.play().catch(() => {});
  };

  const getActivityIcon = (act: any) => {
    switch (act.category) {
      case "interaction":
        return act.type === "heart" ? <Heart className="w-5 h-5 text-rose-500" /> : <Zap className="w-5 h-5 text-amber-500" />;
      case "message":
        return <MessageSquare className="w-5 h-5 text-indigo-500" />;
      case "nickname":
        return <UserRound className="w-5 h-5 text-emerald-500" />;
      case "announcement":
        return <Megaphone className="w-5 h-5 text-blue-500" />;
      default:
        return <Activity className="w-5 h-5 text-zinc-500" />;
    }
  };

  const getActivityText = (act: any) => {
    switch (act.category) {
      case "interaction":
        return act.type === "heart" ? "호감도 발사" : "큐피트 발사";
      case "message":
        return `쪽지 전송: ${act.content}`;
      case "nickname":
        return `닉네임 변경: ${act.old_nickname || "미등록"} → ${act.new_nickname}`;
      case "announcement":
        return `공지 발송: ${act.content}`;
      default:
        return "알 수 없는 활동";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 space-y-8 relative overflow-hidden">
      {/* 백그라운드 효과 */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 blur-[120px] rounded-full" />

      {/* 헤더 및 성능 지표 */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Monitoring Feed</h1>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.4em]">Real-time Operations Central</p>
          </div>
        </div>

        {/* Latency 위젯 (spec002-추가기능 반영) */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">System Latency</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${latency !== null && latency < 500 ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <span className="text-xl font-mono font-bold">
                {latency !== null ? `${latency}ms` : "---"}
              </span>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="glass border-white/10 hover:bg-white/5 gap-2 rounded-xl h-12"
          >
            {soundEnabled ? <Bell className="w-4 h-4 text-indigo-400" /> : <BellOff className="w-4 h-4 text-white/30" />}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4 relative z-10">
        {activities.length === 0 && !loading && (
          <div className="text-center py-32 space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white/10" />
            </div>
            <p className="text-xl font-black text-white/20 uppercase tracking-widest">Awaiting Interactions</p>
          </div>
        )}

        {activities.map((act, idx) => (
          <div 
            key={`${act.id}-${idx}`}
            className="group relative flex items-start gap-4 p-5 rounded-2xl glass border-white/5 hover:border-white/10 transition-all animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div className={`p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform`}>
              {getActivityIcon(act)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] uppercase tracking-tighter bg-white/5 border-white/10">
                    {act.category}
                  </Badge>
                  <span className="text-xs text-zinc-500 font-mono">
                    {new Date(act.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-zinc-100 font-medium tracking-tight">
                {getActivityText(act)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
