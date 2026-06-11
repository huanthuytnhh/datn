import { create } from 'zustand';

export type Page =
  | 'login'
  | 'landing'
  | 'register'
  | 'accept-invite'
  | 'playground'
  | 'dashboard'
  | 'history'
  | 'detail'
  | 'apikeys'
  | 'analytics'
  | 'docs'
  | 'webhooks'
  | 'tenants'
  | 'audit'
  | 'liveness'
  | 'team'
  | 'billing'
  | 'notifications'
  | 'settings'
  | 'models'
  | 'status'
  | 'account';

interface NavigationState {
  currentPage: Page;
  navigate: (page: Page) => void;
  selectedRequestId: string | null;
  setSelectedRequestId: (id: string | null) => void;
}

export const useNavigation = create<NavigationState>((set) => ({
  currentPage: 'landing',
  navigate: (page) => set({ currentPage: page }),
  selectedRequestId: null,
  setSelectedRequestId: (id) => set({ selectedRequestId: id }),
}));
