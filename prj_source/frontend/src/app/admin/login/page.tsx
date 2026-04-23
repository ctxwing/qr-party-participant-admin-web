"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    
    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        toast.error("로그인 실패", {
          description: result.error.message || "이메일 또는 비밀번호를 확인해주세요.",
        });
      } else {
        toast.success("로그인 성공", {
          description: "관리자 대시보드로 이동합니다.",
        });
        router.push("/admin");
      }
    } catch (err) {
      console.error(err);
      toast.error("오류 발생", {
        description: "서버와 통신 중 문제가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden">
      {/* Background decoration for modern glassmorphism aesthetic */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <Card className="w-full max-w-md z-10 border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/50 text-zinc-100">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl font-bold tracking-tight">Admin Login</CardTitle>
          <CardDescription className="text-zinc-400">
            게스트하우스 파티 관리자 시스템
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300" htmlFor="email">
                이메일
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-300" htmlFor="password">
                  비밀번호
                </label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
