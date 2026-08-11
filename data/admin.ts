export type AdminOrderStatus = "결제완료" | "배송준비" | "배송중" | "취소요청";

export type AdminOrder = {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: AdminOrderStatus;
  orderedAt: string;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  joinedAt: string;
};

export const adminOrders: AdminOrder[] = [
  { id: "DR-10842", customer: "김유나", product: "파이브 미닛 데스크 타이머 외 1건", amount: 29800, status: "배송준비", orderedAt: "오늘 14:28" },
  { id: "DR-10841", customer: "박서준", product: "네이비 태블릿 슬리브", amount: 29000, status: "결제완료", orderedAt: "오늘 13:54" },
  { id: "DR-10840", customer: "이채원", product: "클리어 라임 클릭 펜 외 2건", amount: 15900, status: "배송중", orderedAt: "오늘 12:36" },
  { id: "DR-10839", customer: "정하린", product: "데일리 세라믹 머그", amount: 18000, status: "배송준비", orderedAt: "오늘 11:22" },
  { id: "DR-10838", customer: "오민재", product: "블루 스트라이프 삭스 외 1건", amount: 20000, status: "취소요청", orderedAt: "오늘 10:47" },
  { id: "DR-10837", customer: "한소희", product: "코발트 월 프린트", amount: 12000, status: "배송중", orderedAt: "어제 21:16" },
];

export const adminCustomers: AdminCustomer[] = [
  { id: "CU-24018", name: "김유나", email: "yuna.kim@example.com", orders: 6, spent: 184600, joinedAt: "2026.07.18" },
  { id: "CU-24017", name: "박서준", email: "seojun.park@example.com", orders: 2, spent: 47000, joinedAt: "2026.08.02" },
  { id: "CU-24016", name: "이채원", email: "chaewon.lee@example.com", orders: 4, spent: 91300, joinedAt: "2026.06.29" },
  { id: "CU-24015", name: "정하린", email: "harin.jung@example.com", orders: 1, spent: 18000, joinedAt: "2026.08.11" },
  { id: "CU-24014", name: "오민재", email: "minjae.oh@example.com", orders: 3, spent: 62700, joinedAt: "2026.07.21" },
];

export const weeklySales = [
  { day: "월", value: 68 },
  { day: "화", value: 82 },
  { day: "수", value: 57 },
  { day: "목", value: 92 },
  { day: "금", value: 74 },
  { day: "토", value: 100 },
  { day: "일", value: 86 },
];
