"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { defaultColDef, AG_GRID_THEME } from "@/lib/ag-grid-setup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Search, RefreshCw, Edit, ExternalLink, Calendar, Users } from "lucide-react";

export default function PartyListPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchParties = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/parties");
      const result = await res.json();
      if (res.ok) {
        setParties(result.data || []);
      } else {
        toast.error("파티 목록 조회 실패", { description: result.error });
      }
    } catch (err) {
      toast.error("서버 연결 오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/admin/login");
      return;
    }
    if (session) {
      fetchParties();
    }
  }, [session, isPending, router]);

  const filteredParties = useMemo(() => {
    return parties.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [parties, searchTerm]);

  const columnDefs: ColDef[] = [
    {
      field: "name",
      headerName: "파티명",
      flex: 2,
      cellRenderer: (params: any) => (
        <span className="font-bold text-zinc-100">{params.value}</span>
      ),
    },
    {
      field: "status",
      headerName: "상태",
      width: 120,
      cellRenderer: (params: any) => {
        const statusMap: any = {
          draft: { label: "준비중", variant: "secondary" },
          active: { label: "진행중", variant: "default" },
          completed: { label: "종료됨", variant: "outline" },
          cancelled: { label: "취소됨", variant: "destructive" },
        };
        const config = statusMap[params.value] || { label: params.value, variant: "outline" };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      field: "start_at",
      headerName: "시작 시간",
      width: 180,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "-",
    },
    {
      field: "end_at",
      headerName: "종료 시간",
      width: 180,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "-",
    },
    {
      headerName: "관리",
      width: 120,
      pinned: "right",
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2 h-full">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-white/10"
            onClick={() => router.push(`/admin/parties/${params.data.id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-white/10"
            onClick={() => window.open(params.data.qr_anchor_url, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isPending || !session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        인증 확인 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Party Management</h1>
            <p className="text-zinc-400">게스트하우스 파티 일정 및 상태를 관리합니다.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchParties} disabled={loading} className="border-white/10 bg-white/5">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              새로고침
            </Button>
            <Button onClick={() => router.push("/admin/parties/new")} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              새 파티 생성
            </Button>
          </div>
        </header>

        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="파티명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-white/10"
            />
          </div>
          <div className="flex gap-4 text-sm text-zinc-400 ml-auto">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              전체 {parties.length}개
            </div>
          </div>
        </div>

        <div className={`${AG_GRID_THEME} w-full h-[600px] rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50`}>
          <AgGridReact
            rowData={filteredParties}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={20}
            rowHeight={56}
            loadingOverlayComponent={() => <div>로딩 중...</div>}
          />
        </div>
      </div>
    </div>
  );
}
