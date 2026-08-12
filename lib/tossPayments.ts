export const TOSS_PENDING_PAYMENT_KEY = "drop-room-toss-pending-payment";

export const TOSS_TEST_CLIENT_KEY =
  process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ||
  "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export type PendingTossPayment = {
  orderId: string;
  orderName: string;
  amount: number;
  createdAt: string;
};

export function createTossOrderId() {
  return `DROP-${crypto.randomUUID()}`;
}

export function getTossRedirectUrl(pathname: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${window.location.origin}${basePath}${pathname}`;
}

export function readPendingTossPayment(value: string | null): PendingTossPayment | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<PendingTossPayment>;
    if (
      typeof parsed.orderId !== "string" ||
      typeof parsed.orderName !== "string" ||
      typeof parsed.amount !== "number" ||
      typeof parsed.createdAt !== "string"
    ) {
      return null;
    }

    return parsed as PendingTossPayment;
  } catch {
    return null;
  }
}
