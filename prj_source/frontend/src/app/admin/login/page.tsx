"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDevLogin = async () => {
    setEmail("admin@gmail.com");
    setPassword("Admin1234!");
    // 상태 반영 후 로그인을 시도하기 위해 약간의 지연을 줍니다.
    setTimeout(() => {
      const loginButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      loginButton?.click();
    }, 100);
  };

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
        window.location.href = "/admin";
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
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center mb-2">
            <div className="relative p-3 rounded-2xl bg-indigo-600/10 border border-white/10 backdrop-blur-md shadow-xl group hover:bg-indigo-600/20 transition-all duration-500">
              <div className="absolute inset-0 bg-indigo-600/20 blur-xl rounded-full group-hover:blur-2xl transition-all opacity-50"></div>
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={48} 
                height={48} 
                className="relative rounded-lg shadow-2xl"
              />
            </div>
          </div>
          <CardTitle className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
            Admin Login
          </CardTitle>
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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col pt-4 gap-6">
            <Button 
              type="submit" 
              size="lg"
              className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] border-t border-white/10" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>

            <div className="w-full pt-6 border-t border-white/5">
              <Button
                type="button"
                variant="ghost"
                onClick={handleDevLogin}
                className="w-full h-10 border border-white/5 bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-zinc-300 transition-all text-xs font-mono tracking-widest"
              >
                [ DEV: ADMIN AUTO-LOGIN ]
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
