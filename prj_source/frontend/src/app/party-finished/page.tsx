"use client";

import { motion } from "framer-motion";
import { PartyPopper, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PartyFinishedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Aesthetic background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/20 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 space-y-8 max-w-md"
      >
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse" />
          <div className="relative bg-zinc-900 w-24 h-24 rounded-full flex items-center justify-center border border-white/10 mx-auto shadow-2xl">
            <PartyPopper className="w-12 h-12 text-indigo-400" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">
            PARTY FINISHED!
          </h1>
          <p className="text-zinc-400 font-medium leading-relaxed">
            파티 세션이 성공적으로 종료되었습니다.<br />
            함께해주신 모든 분들께 감사드립니다!
          </p>
        </div>

        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-center gap-2 text-indigo-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            THANK YOU FOR JOINING
          </div>
          <p className="text-xs text-zinc-500">
            랭킹 결과 및 사진 등은 추후 안내되는 링크를 통해 확인하실 수 있습니다.
          </p>
        </div>

        <Button 
          onClick={() => router.push("/")}
          className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Home className="mr-2 h-5 w-5" />
          홈으로 돌아가기
        </Button>
      </motion.div>
    </div>
  );
}
