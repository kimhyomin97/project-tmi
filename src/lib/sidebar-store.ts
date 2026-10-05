// 사이드바 접힘 상태. 라우트를 넘어 유지돼야 하고, 떨어진 두 client 부품(틀·접기 버튼)이 함께 읽어서 Zustand에 둔다(L3).
// 서버는 localStorage를 모르고 늘 펼친 상태로 그린다. 첫 렌더부터 저장값을 쓰면 hydration이 어긋나므로
// skipHydration으로 미뤄 두고, 첫 렌더 뒤 SidebarFrame이 rehydrate()를 부른다.
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SidebarState = {
  collapsed: boolean;
  toggleCollapsed: () => void;
};

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
    }),
    { name: "tmi-sidebar", skipHydration: true },
  ),
);
