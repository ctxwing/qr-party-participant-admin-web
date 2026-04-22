import { create } from 'zustand'

interface Participant {
  id: string
  nickname: string
  nicknameChangeCount: number
}

interface PartySession {
  id: string
  title: string
  status: 'READY' | 'ONGOING' | 'FINISHED'
  endTime: Date | null
}

interface Alert {
  id: string
  type: 'SOS' | 'SYSTEM'
  message: string
  createdAt: Date
}

interface AppState {
  participant: Participant | null
  session: PartySession | null
  alerts: Alert[]
  
  // Actions
  setParticipant: (participant: Participant | null) => void
  setSession: (session: PartySession | null) => void
  addAlert: (alert: Alert) => void
  clearAlerts: () => void
}

export const useStore = create<AppState>((set) => ({
  participant: null,
  session: null,
  alerts: [],

  setParticipant: (participant) => set({ participant }),
  setSession: (session) => set({ session }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  clearAlerts: () => set({ alerts: [] }),
}))
