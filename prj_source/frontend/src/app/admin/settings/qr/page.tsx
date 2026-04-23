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
  const [fgColor, setFgColor] = useState("#4f46e5");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/admin/login");
    }
  }, [session, isPending, router]);

  const handleSave = async () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("QR 설정이 저장되었습니다.");
      setLoading(false);
    }, 1000);
  };

  const downloadQR = (format: 'png' | 'svg') => {
    const svg = document.getElementById("qr-preview-svg");
    if (!svg) return;

    if (format === 'svg') {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `party-qr-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const canvas = document.createElement("canvas");
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width * 4; // High res
        canvas.height = img.height * 4;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const pngUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = `party-qr-${Date.now()}.png`;
          link.click();
        }
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    }
    toast.success(`${format.toUpperCase()} 파일로 다운로드되었습니다.`);
  };

  if (isPending || !session) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-1 border-b border-white/10 pb-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <QrCode className="text-indigo-400" />
            Branded QR Settings
          </h1>
          <p className="text-zinc-400">브랜딩이 적용된 QR 코드를 생성하고 다운로드합니다.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="glass border-none shadow-2xl">
            <CardHeader>
              <CardTitle>앵커 URL 및 스타일</CardTitle>
              <CardDescription>
                접속 경로와 QR 코드의 색상을 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">접속 URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    value={qrAnchorUrl}
                    onChange={(e) => setQrAnchorUrl(e.target.value)}
                    className="pl-10 bg-zinc-900/50 border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">포인트 색상 (Branding Color)</label>
                <div className="flex gap-4 items-center">
                  <Input 
                    type="color" 
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-16 h-10 p-1 bg-zinc-900 border-white/10 cursor-pointer"
                  />
                  <Input 
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 bg-zinc-900/50 border-white/10 font-mono"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button onClick={handleSave} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                설정 저장
              </Button>
            </CardFooter>
          </Card>

          <Card className="glass border-none shadow-2xl flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-white p-6 rounded-2xl shadow-inner mb-6">
              <QRCodeSVG 
                id="qr-preview-svg"
                value={qrAnchorUrl} 
                size={220}
                level="H"
                fgColor={fgColor}
                includeMargin={false}
              />
            </div>
            <div className="space-y-4 w-full">
              <div className="space-y-1">
                <h3 className="font-bold text-lg">실시간 브랜딩 프리뷰</h3>
                <p className="text-xs text-zinc-500">{qrAnchorUrl}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="border-white/10 bg-white/5" onClick={() => downloadQR('png')}>
                  PNG 다운로드
                </Button>
                <Button variant="outline" className="border-white/10 bg-white/5" onClick={() => downloadQR('svg')}>
                  SVG 다운로드
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
