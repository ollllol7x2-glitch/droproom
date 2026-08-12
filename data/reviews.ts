import type { CategoryKey } from "@/data/products";

export type SeedReview = {
  id: string;
  author: string;
  rating: number;
  content: string;
  purchasedOption: string;
  createdAt: string;
  photo?: string;
  photoAlt?: string;
};

const categoryReviewCopy: Record<CategoryKey, Array<Omit<SeedReview, "id" | "purchasedOption">>> = {
  stationery: [
    { author: "윤*아", rating: 5, content: "사진보다 색이 또렷해서 책상 위에서 바로 찾기 좋아요. 매일 쓰는 물건인데 손에 닿는 느낌도 편해서 자주 집게 됩니다.", createdAt: "2026-08-08T09:20:00.000Z" },
    { author: "민*", rating: 4, content: "크기와 무게가 부담 없고 마감도 깔끔해요. 포장도 과하지 않아서 가벼운 선물로 좋았습니다.", createdAt: "2026-08-03T14:12:00.000Z" },
    { author: "하*진", rating: 5, content: "노트랑 함께 두니 색 조합이 예뻐서 공부 시작할 때 기분이 좋아져요. 실사용 만족도가 높습니다.", createdAt: "2026-07-28T18:40:00.000Z" },
  ],
  digital: [
    { author: "서*", rating: 5, content: "가방 안에서 부피를 많이 차지하지 않으면서 필요한 역할은 확실히 해요. 컬러도 화면보다 차분해서 오래 쓰기 좋습니다.", createdAt: "2026-08-07T11:14:00.000Z" },
    { author: "지*원", rating: 4, content: "마감이 매끈하고 손에 걸리는 부분이 없어요. 통학할 때 매일 쓰고 있는데 아직 형태가 잘 유지됩니다.", createdAt: "2026-08-01T20:10:00.000Z" },
    { author: "도*", rating: 5, content: "기능만 보고 샀는데 실제로 받아보니 색이 더 마음에 들어요. 작은 불편을 딱 필요한 만큼 줄여주는 제품입니다.", createdAt: "2026-07-24T08:30:00.000Z" },
  ],
  room: [
    { author: "나*영", rating: 5, content: "방에 두자마자 분위기가 달라졌어요. 크기가 과하지 않아 작은 책상에도 잘 맞고 밤에 켜두면 빛이 부드럽습니다.", createdAt: "2026-08-09T21:05:00.000Z" },
    { author: "예*", rating: 5, content: "사진에서 본 색감과 거의 같고 오브제처럼 두기 좋아요. 불을 켜지 않은 낮에도 포인트가 됩니다.", createdAt: "2026-08-02T16:42:00.000Z" },
    { author: "주*현", rating: 4, content: "포장이 단단해서 안전하게 받았어요. 침대 옆 협탁에 두기 좋은 크기이고 다른 소품과도 잘 어울립니다.", createdAt: "2026-07-27T19:32:00.000Z" },
  ],
  fashion: [
    { author: "소*", rating: 5, content: "가볍고 필요한 것만 담기 좋아서 주말마다 들고 있어요. 캐주얼한 옷에도 자연스럽게 어울립니다.", createdAt: "2026-08-10T13:25:00.000Z" },
    { author: "유*빈", rating: 4, content: "실제 색이 너무 튀지 않고 포인트가 되는 정도라 활용하기 쉬워요. 마감도 가격 대비 만족스럽습니다.", createdAt: "2026-08-04T17:18:00.000Z" },
    { author: "김*", rating: 5, content: "착용감이 편하고 사진보다 소재가 탄탄해요. 친구가 보고 어디서 샀냐고 물어봤습니다.", createdAt: "2026-07-30T10:05:00.000Z" },
  ],
  living: [
    { author: "은*", rating: 5, content: "매일 손이 가는 물건이라 단순한 형태가 마음에 들어요. 닦기도 편하고 식탁이나 책상 어디에 둬도 잘 어울립니다.", createdAt: "2026-08-06T12:46:00.000Z" },
    { author: "다*", rating: 4, content: "생각했던 것보다 안정감이 있고 표면 마감도 깔끔해요. 생활 공간이 조금 정돈되어 보입니다.", createdAt: "2026-07-31T09:38:00.000Z" },
    { author: "정*우", rating: 5, content: "선물로 보냈는데 받는 분이 색과 형태 모두 마음에 든다고 했어요. 실용적인 디자인 제품을 찾을 때 좋습니다.", createdAt: "2026-07-25T15:55:00.000Z" },
  ],
  hobby: [
    { author: "채*", rating: 5, content: "휴대폰을 잠깐 내려놓고 집중하기 좋았어요. 준비가 복잡하지 않아 짧게 쉬고 싶을 때 바로 꺼내게 됩니다.", createdAt: "2026-08-05T22:14:00.000Z" },
    { author: "아*", rating: 4, content: "작지만 완성도가 좋고 색도 선명해요. 친구와 같이 하거나 혼자 조용히 시간을 보내기 좋습니다.", createdAt: "2026-07-29T18:22:00.000Z" },
    { author: "현*", rating: 5, content: "구성이 부담스럽지 않아서 취미를 처음 시작하는 사람에게 잘 맞아요. 패키지도 보관하기 편합니다.", createdAt: "2026-07-22T11:47:00.000Z" },
  ],
};

const featuredPhotoReviews: Record<string, Omit<SeedReview, "id">> = {
  "clear-lime-click-pen": {
    author: "채*린", rating: 5, content: "노트 필기할 때 계속 쓰고 있어요. 투명 라임 색이 사진보다 맑고, 가방 안에서도 금방 보여서 좋습니다. 클릭감도 가벼워요.", purchasedOption: "Lime", createdAt: "2026-08-11T16:10:00.000Z", photo: "/images/reviews/clear-lime-desk-review.jpg", photoAlt: "코발트 노트 위에 놓인 투명 라임 클릭 펜 포토 리뷰",
  },
  "mini-mushroom-lamp": {
    author: "수*", rating: 5, content: "밤에 책 읽을 때 켜두면 방 전체가 과하게 밝아지지 않아 좋아요. 체리 색이 포인트가 되고 크기도 협탁에 딱 맞습니다.", purchasedOption: "Cherry", createdAt: "2026-08-11T22:35:00.000Z", photo: "/images/reviews/mushroom-lamp-night-review.jpg", photoAlt: "침실 책상에서 켜 둔 체리 레드 머시룸 램프 포토 리뷰",
  },
  "navy-pocket-bag": {
    author: "지*민", rating: 5, content: "휴대폰, 카드지갑, 립밤만 넣고 나갈 때 가장 편해요. 스트랩 길이 조절도 쉽고 네이비라 어떤 옷에도 무난하게 맞습니다.", purchasedOption: "Navy", createdAt: "2026-08-10T15:42:00.000Z", photo: "/images/reviews/navy-pocket-bag-review.jpg", photoAlt: "회색 후디에 네이비 포켓 미니백을 착용한 포토 리뷰",
  },
};

export function getSeedReviews(productSlug: string, category: CategoryKey, colors: string[]): SeedReview[] {
  const optionFallback = colors[0] || "기본 옵션";
  const textReviews = categoryReviewCopy[category].map((review, index) => ({
    ...review,
    id: `seed-${productSlug}-${index + 1}`,
    purchasedOption: colors[index % Math.max(colors.length, 1)] || optionFallback,
  }));
  const photoReview = featuredPhotoReviews[productSlug];
  return photoReview ? [{ ...photoReview, id: `seed-${productSlug}-photo` }, ...textReviews] : textReviews;
}
