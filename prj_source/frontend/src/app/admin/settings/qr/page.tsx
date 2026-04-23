"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { QrCode, Save, RefreshCw, ExternalLink, Globe } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function QRSettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [qrAnchorUrl, setQrAnchorUrl] = useState("https://qr-party.example.com/join");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/admin/login");
    }
  }, [session, isPending, router]);

  const handleSave = async () => {
    setLoading(true);
    // 실제로는 DB의 글로벌 설정 테이블이나 환경 변수를 업데이트하는 API 호출 필요
    setTimeout(() => {
      toast.success("QR 설정이 저장되었습니다.");
      setLoading(false);
    }, 1000);
  };

  if (isPending || !session) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-1 border-b border-white/10 pb-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <QrCode className="text-indigo-400" />
            QR Code Settings
          </h1>
          <p className="text-zinc-400">참여자 접속용 QR 코드 및 앵커 URL을 관리합니다.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="glass border-none shadow-2xl">
            <CardHeader>
              <CardTitle>앵커 URL 설정</CardTitle>
              <CardDescription>
                참여자가 QR 코드를 스캔했을 때 리디렉션될 기본 URL입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Base URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input 
                      value={qrAnchorUrl}
                      onChange={(e) => setQrAnchorUrl(e.target.value)}
                      className="pl-10 bg-zinc-900/50 border-white/10"
                    />
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 bg-white/5 p-3 rounded-lg border border-white/5">
                팁: 각 파티별 고유 접속 URL은 `[Base URL]?party=[ID]` 형식을 사용하게 됩니다.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                설정 저장
              </Button>
            </CardFooter>
          </Card>

          <Card className="glass border-none shadow-2xl flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-white p-6 rounded-2xl shadow-inner mb-6">
              <QRCodeSVG 
                value={qrAnchorUrl} 
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg">실시간 QR 프리뷰</h3>
              <p className="text-sm text-zinc-500">설정한 URL이 반영된 QR 코드입니다.</p>
              <Button variant="link" className="text-indigo-400" onClick={() => window.open(qrAnchorUrl, "_blank")}>
                URL 테스트 하기 <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
