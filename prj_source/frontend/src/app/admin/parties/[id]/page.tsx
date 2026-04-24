"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { defaultColDef, AG_GRID_THEME } from "@/lib/ag-grid-setup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  Users, 
  Settings, 
  Filter, 
  Clock, 
  Heart, 
  Zap,
  Send,
  Plus,
  Minus,
  UserCheck,
  UserX,
  ShieldAlert
} from "lucide-react";

const PRESETS = [
  { id: "general", name: "일반 (Default)", hearts: 3, cupids: 3, description: "일반적인 게스트하우스 파티" },
  { id: "active", name: "열정 (Active)", hearts: 5, cupids: 5, description: "활동성이 높은 이벤트 파티" },
  { id: "custom", name: "커스텀 (Custom)", hearts: 0, cupids: 0, description: "관리자 수동 설정" },
];

export default function PartyDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: session, isPending } = useSession();
  
  const [party, setParty] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterUnfinished, setFilterUnfinished] = useState(false);
  
  const [bulkGrantType, setBulkGrantType] = useState<"hearts" | "cupids">("hearts");
  const [bulkGrantAmount, setBulkGrantAmount] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_at: "",
    end_at: "",
    max_participants: 0,
    preset_type: "general",
    initial_hearts: 3,
    initial_cupids: 3,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const partyRes = await fetch(`/api/admin/parties/${id}`);
      const partyData = await partyRes.json();
      if (partyRes.ok) {
        const p = partyData.data;
        setParty(p);
        setFormData({
          name: p.name || "",
          description: p.description || "",
          start_at: p.start_at ? new Date(p.start_at).toISOString().slice(0, 16) : "",
          end_at: p.end_at ? new Date(p.end_at).toISOString().slice(0, 16) : "",
          max_participants: p.max_participants || 0,
          preset_type: p.preset_type || "general",
          initial_hearts: p.initial_hearts || 3,
          initial_cupids: p.initial_cupids || 3,
        });
      }

      const participantsRes = await fetch(`/api/admin/parties/${id}/participants`);
      const participantsData = await participantsRes.json();
      if (participantsRes.ok) {
        setParticipants(participantsData.data || []);
      }
    } catch (err) {
      toast.error("데이터 로드 오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/admin/login");
      return;
    }
    if (session && id) {
      fetchData();
    }
  }, [session, isPending, id, router]);

  const handleUpdateParticipant = async (pId: string, data: any) => {
    try {
      const res = await fetch(`/api/admin/participants/${pId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("업데이트 완료");
        fetchData(); // 새로고침
      }
    } catch (err) {
      toast.error("업데이트 실패");
    }
  };

  const handleBulkGrant = async () => {
    try {
      const res = await fetch(`/api/admin/parties/${id}/bulk-grant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: bulkGrantType, amount: bulkGrantAmount }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        fetchData();
      }
    } catch (err) {
      toast.error("일괄 지급 실패");
    }
  };

  const participantColumnDefs: ColDef[] = [
    { field: "nickname", headerName: "닉네임", flex: 1, cellRenderer: (p: any) => p.value || "미등록" },
    { 
      field: "status", 
      headerName: "상태", 
      width: 100,
      cellRenderer: (p: any) => {
        const variants: any = { pending: "secondary", approved: "default", rejected: "destructive", banned: "outline" };
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <Badge variant={variants[p.value] || "outline"} className="cursor-pointer hover:opacity-80">
                  {p.value}
                </Badge>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>상태 변경: {p.data.nickname}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-2 pt-4">
                <Button onClick={() => handleUpdateParticipant(p.data.id, { status: 'approved' })} variant="outline" className="border-emerald-500/50 hover:bg-emerald-500/10"><UserCheck className="mr-2 h-4 w-4" />승인</Button>
                <Button onClick={() => handleUpdateParticipant(p.data.id, { status: 'rejected' })} variant="outline" className="border-rose-500/50 hover:bg-rose-500/10"><UserX className="mr-2 h-4 w-4" />반려</Button>
                <Button onClick={() => handleUpdateParticipant(p.data.id, { status: 'pending' })} variant="outline">대기</Button>
                <Button onClick={() => handleUpdateParticipant(p.data.id, { status: 'banned' })} variant="destructive">추방/정지</Button>
              </div>
            </DialogContent>
          </Dialog>
        );
      }
    },
    { 
      headerName: "호감도", 
      width: 120,
      cellRenderer: (p: any) => (
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleUpdateParticipant(p.data.id, { hearts_count: Math.max(0, p.data.hearts_count - 1) })}><Minus className="h-3 w-3" /></Button>
          <span className="font-bold min-w-[20px] text-center">{p.data.hearts_count}</span>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleUpdateParticipant(p.data.id, { hearts_count: p.data.hearts_count + 1 })}><Plus className="h-3 w-3" /></Button>
        </div>
      )
    },
    { 
      headerName: "큐피트", 
      width: 120,
      cellRenderer: (p: any) => (
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleUpdateParticipant(p.data.id, { cupids_count: Math.max(0, p.data.cupids_count - 1) })}><Minus className="h-3 w-3" /></Button>
          <span className="font-bold min-w-[20px] text-center">{p.data.cupids_count}</span>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleUpdateParticipant(p.data.id, { cupids_count: p.data.cupids_count + 1 })}><Plus className="h-3 w-3" /></Button>
        </div>
      )
    },
    { 
      headerName: "신청", 
      width: 100,
      valueGetter: (p: any) => `${p.data.is_first_entry ? "1차O" : "1차X"} / ${p.data.is_second_entry ? "2차O" : "2차X"}`
    }
  ];

  if (loading && !party) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
            <h1 className="text-3xl font-bold tracking-tight">{party?.name} 관리</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchData} className="border-white/10 bg-white/5"><RefreshCw className="h-4 w-4 mr-2" />새로고침</Button>
            <Button onClick={() => toast.info("저장 기능은 상세 페이지의 각 섹션에서 수행됩니다.")} className="bg-indigo-600 hover:bg-indigo-700"><Save className="h-4 w-4 mr-2" />전체 저장</Button>
          </div>
        </header>

        {/* 일괄 지급 컨트롤 패널 (T024 신규) */}
        <Card className="bg-indigo-600/10 border-indigo-500/30 text-white backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-indigo-400" />실시간 일괄 지급 (Bulk Grant)</CardTitle>
            <CardDescription className="text-indigo-200/50">현재 파티의 모든 참여자에게 동시에 상호작용 횟수를 추가합니다.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <Button 
                variant={bulkGrantType === "hearts" ? "default" : "outline"} 
                onClick={() => setBulkGrantType("hearts")}
                className={bulkGrantType === "hearts" ? "bg-rose-600" : "bg-white/5"}
              >
                <Heart className="mr-2 h-4 w-4" />호감도
              </Button>
              <Button 
                variant={bulkGrantType === "cupids" ? "default" : "outline"} 
                onClick={() => setBulkGrantType("cupids")}
                className={bulkGrantType === "cupids" ? "bg-amber-600" : "bg-white/5"}
              >
                <Zap className="mr-2 h-4 w-4" />큐피트
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Label>지급 수량:</Label>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setBulkGrantAmount(Math.max(1, bulkGrantAmount - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="text-xl font-bold w-8 text-center">{bulkGrantAmount}</span>
                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setBulkGrantAmount(bulkGrantAmount + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
            <Button onClick={handleBulkGrant} className="bg-indigo-600 hover:bg-indigo-700 font-bold ml-auto">
              지금 즉시 일괄 지급하기
            </Button>
          </CardContent>
        </Card>

        {/* 기존 참여자 목록 (T024 액션 추가됨) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-indigo-400" />참여자 실시간 관리</h2>
            <Button 
              variant={filterUnfinished ? "default" : "outline"} 
              onClick={() => setFilterUnfinished(!filterUnfinished)}
              className={filterUnfinished ? "bg-amber-600" : "bg-white/5"}
            >
              <Filter className="h-4 w-4 mr-2" />2차 미완료자 필터
            </Button>
          </div>

          <div className={`${AG_GRID_THEME} w-full h-[600px] rounded-xl overflow-hidden border border-white/10`}>
            <AgGridReact
              rowData={filterUnfinished ? participants.filter(p => p.nickname && !p.is_second_entry) : participants}
              columnDefs={participantColumnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={20}
              rowHeight={56}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
