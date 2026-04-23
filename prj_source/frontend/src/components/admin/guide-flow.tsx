"use client";

import { CheckCircle2, ChevronRight, HelpCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

const steps = [
  { id: "create", title: "파티 생성", desc: "기본 정보 및 일정 설정" },
  { id: "recruit", title: "참여자 입장", desc: "QR 코드로 참여자 접속" },
  { id: "start", title: "파티 시작", desc: "실시간 상호작용 활성화" },
  { id: "announce", title: "공지 발송", desc: "참여자에게 실시간 알림" },
  { id: "finish", title: "파티 종료", desc: "세션 마무리 및 결과 확인" },
];

interface GuideFlowProps {
  currentStep?: string;
}

export function GuideFlow({ currentStep = "create" }: GuideFlowProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400" />
          운영 가이드 플로우
        </h3>
        
        <Dialog>
          <DialogTrigger render={
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/5">
              <HelpCircle className="w-4 h-4 mr-2" />
              상세 운영 매뉴얼
            </Button>
          } />
          <DialogContent className="max-w-2xl bg-zinc-900 border-white/10 text-zinc-100">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">파티 관리자 상세 운영 매뉴얼</DialogTitle>
              <DialogDescription className="text-zinc-400">
                효과적인 파티 운영을 위한 단계별 가이드입니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4 overflow-y-auto max-h-[60vh] pr-2">
              <section className="space-y-2">
                <h4 className="text-indigo-400 font-bold">1. 파티 준비 단계</h4>
                <p className="text-sm text-zinc-300">
                  파티 목록 페이지에서 '새 파티 생성'을 클릭하여 파티 이름과 시간을 설정합니다. 생성된 QR 코드 앵커 URL을 통해 참여자들이 접속할 수 있도록 안내합니다.
                </p>
              </section>
              <section className="space-y-2">
                <h4 className="text-indigo-400 font-bold">2. 실시간 운영 단계</h4>
                <p className="text-sm text-zinc-300">
                  파티 상태를 '진행중'으로 변경하면 참여자들의 쪽지 보내기, 호감도 표시 등이 활성화됩니다. 대시보드에서 실시간 SOS 요청이나 노래 신청을 모니터링하세요.
                </p>
              </section>
              <section className="space-y-2">
                <h4 className="text-indigo-400 font-bold">3. 공지 사항 활용</h4>
                <p className="text-sm text-zinc-300">
                  '실시간 공지' 기능을 통해 모든 참여자의 화면에 즉시 메시지를 띄울 수 있습니다. 중요한 게임 시작이나 일정 변경 시 활용하세요.
                </p>
              </section>
              <section className="space-y-2">
                <h4 className="text-indigo-400 font-bold">4. 파티 종료</h4>
                <p className="text-sm text-zinc-300">
                  파티가 끝나면 상태를 '종료됨'으로 변경합니다. 종료 후에는 참여자들의 상호작용이 비활성화되며 데이터가 보존됩니다.
                </p>
              </section>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          
          return (
            <div key={step.id} className="relative group">
              <div 
                className={`p-3 rounded-xl border transition-all duration-300 ${
                  isActive 
                    ? "bg-indigo-600/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
                    : isCompleted 
                    ? "bg-emerald-500/5 border-emerald-500/20" 
                    : "bg-white/5 border-white/5 opacity-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <div className={`w-4 h-4 rounded-full border ${isActive ? "border-indigo-400 border-2" : "border-zinc-600"} flex items-center justify-center text-[10px] font-bold`}>
                      {index + 1}
                    </div>
                  )}
                  <span className={`text-xs font-bold ${isActive ? "text-indigo-400" : isCompleted ? "text-emerald-500" : "text-zinc-500"}`}>
                    {step.title}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 line-clamp-1">{step.desc}</p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-2 -translate-y-1/2 z-10">
                  <ChevronRight className="w-4 h-4 text-zinc-700" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
