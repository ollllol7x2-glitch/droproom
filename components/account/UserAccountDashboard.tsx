"use client";

import {
  ArrowRight,
  Check,
  Heart,
  HouseLine,
  MapPinLine,
  PencilSimple,
  Plus,
  SignOut,
  Trash,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { KakaoAddressFields } from "@/components/commerce/KakaoAddressFields";
import { useStore } from "@/components/commerce/StoreProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type AccountSection = "overview" | "profile" | "addresses";

type AccountProfile = {
  name: string;
  email: string;
  phone: string;
  marketing: boolean;
};

type SavedAddress = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  postcode: string;
  address: string;
  detail: string;
  isDefault: boolean;
};

type AccountIdentity = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  metadata?: Record<string, unknown>;
};

type UserAccountDashboardProps = {
  identity: AccountIdentity;
  persistence: "supabase" | "browser";
  onSignOut?: () => Promise<void>;
  signOutAction?: (formData: FormData) => Promise<void>;
};

type Notice = {
  tone: "success" | "error";
  message: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getInitialProfile(identity: AccountIdentity): AccountProfile {
  const stored = isRecord(identity.metadata?.droproom_profile)
    ? identity.metadata.droproom_profile
    : {};

  return {
    name: readText(stored.name) || identity.name,
    email: identity.email,
    phone: readText(stored.phone),
    marketing: typeof stored.marketing === "boolean" ? stored.marketing : false,
  };
}

function getInitialAddresses(metadata: Record<string, unknown> | undefined): SavedAddress[] {
  if (!Array.isArray(metadata?.droproom_addresses)) return [];

  return metadata.droproom_addresses.flatMap((item) => {
    if (!isRecord(item)) return [];
    const id = readText(item.id);
    const address = readText(item.address);
    if (!id || !address) return [];

    return [{
      id,
      label: readText(item.label) || "배송지",
      recipient: readText(item.recipient),
      phone: readText(item.phone),
      postcode: readText(item.postcode),
      address,
      detail: readText(item.detail),
      isDefault: item.isDefault === true,
    }];
  });
}

function makeEmptyAddress(): SavedAddress {
  return {
    id: `address-${Date.now()}`,
    label: "집",
    recipient: "",
    phone: "",
    postcode: "",
    address: "",
    detail: "",
    isDefault: false,
  };
}

export function UserAccountDashboard({
  identity,
  persistence,
  onSignOut,
  signOutAction,
}: UserAccountDashboardProps) {
  const { wishlist } = useStore();
  const initialProfile = useMemo(() => getInitialProfile(identity), [identity]);
  const initialAddresses = useMemo(() => getInitialAddresses(identity.metadata), [identity.metadata]);
  const [section, setSection] = useState<AccountSection>("overview");
  const [profile, setProfile] = useState<AccountProfile>(initialProfile);
  const [addresses, setAddresses] = useState<SavedAddress[]>(initialAddresses);
  const [addressEditor, setAddressEditor] = useState<SavedAddress | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [saving, setSaving] = useState(false);
  const addressDetailRef = useRef<HTMLInputElement>(null);
  const userInitial = profile.name.trim().slice(0, 1).toUpperCase() || "D";
  const defaultAddress = addresses.find((item) => item.isDefault) ?? addresses[0];
  const storageKey = `drop-room-account:${identity.id}`;

  useEffect(() => {
    if (initialAddresses.length > 0 || identity.metadata?.droproom_profile) return;

    try {
      const cached = window.localStorage.getItem(storageKey);
      if (!cached) return;
      const parsed: unknown = JSON.parse(cached);
      if (!isRecord(parsed)) return;

      if (isRecord(parsed.profile)) {
        setProfile({
          name: readText(parsed.profile.name) || identity.name,
          email: identity.email,
          phone: readText(parsed.profile.phone),
          marketing: parsed.profile.marketing === true,
        });
      }
      if (Array.isArray(parsed.addresses)) {
        setAddresses(getInitialAddresses({ droproom_addresses: parsed.addresses }));
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [identity.email, identity.metadata, identity.name, initialAddresses.length, storageKey]);

  useEffect(() => {
    if (!addressEditor) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAddressEditor(null);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [addressEditor]);

  const persistAccount = async (
    nextProfile: AccountProfile,
    nextAddresses: SavedAddress[],
    successMessage: string,
  ) => {
    setSaving(true);
    setNotice(null);

    try {
      if (persistence === "supabase") {
        const { error } = await getSupabaseBrowserClient().auth.updateUser({
          data: {
            full_name: nextProfile.name,
            name: nextProfile.name,
            droproom_profile: nextProfile,
            droproom_addresses: nextAddresses,
          },
        });
        if (error) throw error;
      }

      window.localStorage.setItem(storageKey, JSON.stringify({
        profile: nextProfile,
        addresses: nextAddresses,
      }));
      setProfile(nextProfile);
      setAddresses(nextAddresses);
      setNotice({ tone: "success", message: successMessage });
      return true;
    } catch {
      setNotice({
        tone: "error",
        message: "저장하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await persistAccount(profile, addresses, "내 정보를 저장했습니다.");
  };

  const saveAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!addressEditor) return;

    const exists = addresses.some((item) => item.id === addressEditor.id);
    const shouldBeDefault = addressEditor.isDefault || addresses.length === 0;
    const savedAddress = { ...addressEditor, isDefault: shouldBeDefault };
    let nextAddresses = exists
      ? addresses.map((item) => item.id === savedAddress.id ? savedAddress : item)
      : [...addresses, savedAddress];

    if (shouldBeDefault) {
      nextAddresses = nextAddresses.map((item) => ({
        ...item,
        isDefault: item.id === savedAddress.id,
      }));
    }

    const saved = await persistAccount(profile, nextAddresses, "배송지를 저장했습니다.");
    if (saved) setAddressEditor(null);
  };

  const makeDefault = async (id: string) => {
    const nextAddresses = addresses.map((item) => ({ ...item, isDefault: item.id === id }));
    await persistAccount(profile, nextAddresses, "기본 배송지를 변경했습니다.");
  };

  const removeAddress = async (id: string) => {
    if (!window.confirm("이 배송지를 삭제할까요?")) return;
    const wasDefault = addresses.find((item) => item.id === id)?.isDefault;
    const nextAddresses = addresses.filter((item) => item.id !== id);
    if (wasDefault && nextAddresses[0]) nextAddresses[0] = { ...nextAddresses[0], isDefault: true };
    await persistAccount(profile, nextAddresses, "배송지를 삭제했습니다.");
  };

  const navItems: Array<{ key: AccountSection; label: string; icon: React.ReactNode }> = [
    { key: "overview", label: "내 계정", icon: <HouseLine size={21} /> },
    { key: "profile", label: "내 정보 관리", icon: <UserCircle size={21} /> },
    { key: "addresses", label: "배송지 관리", icon: <MapPinLine size={21} /> },
  ];

  return (
    <div className="shell account-dashboard-page">
      <header className="account-dashboard-heading">
        <p>MY DROP ROOM</p>
        <h1>마이페이지</h1>
        <span>내 정보와 자주 쓰는 배송지를 한곳에서 관리하세요.</span>
      </header>

      <div className="account-dashboard-layout">
        <aside className="account-sidebar" aria-label="마이페이지 메뉴">
          <div className="account-sidebar-profile">
            {identity.image ? (
              // Google 프로필 이미지는 사용자 계정에서 직접 제공됩니다.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={identity.image} alt="" referrerPolicy="no-referrer" />
            ) : (
              <span aria-hidden="true">{userInitial}</span>
            )}
            <div>
              <strong>{profile.name}</strong>
              <small>{profile.email}</small>
            </div>
          </div>

          <nav>
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={section === item.key ? "active" : ""}
                onClick={() => {
                  setSection(item.key);
                  setNotice(null);
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <Link href="/wishlist"><Heart size={21} /> 찜한 상품</Link>
          </nav>

          {signOutAction ? (
            <form action={signOutAction} className="account-signout-form">
              <button type="submit"><SignOut size={20} /> 로그아웃</button>
            </form>
          ) : (
            <button className="account-signout-button" type="button" onClick={() => void onSignOut?.()}>
              <SignOut size={20} /> 로그아웃
            </button>
          )}
        </aside>

        <div className="account-dashboard-content">
          {notice && (
            <div className={`account-notice ${notice.tone}`} role={notice.tone === "error" ? "alert" : "status"}>
              {notice.tone === "success" && <Check size={19} weight="bold" />}
              {notice.message}
            </div>
          )}

          {section === "overview" && (
            <section className="account-overview" aria-labelledby="account-overview-title">
              <div className="account-section-head">
                <div>
                  <h2 id="account-overview-title">반가워요, {profile.name}님.</h2>
                  <p>저장한 취향과 배송 정보를 빠르게 확인할 수 있어요.</p>
                </div>
                <Link href="/shop">쇼핑 계속하기 <ArrowRight size={19} /></Link>
              </div>

              <div className="account-overview-grid">
                <article className="account-overview-wish">
                  <Heart size={26} />
                  <span>찜한 상품</span>
                  <strong>{wishlist.length}</strong>
                  <Link href="/wishlist">목록 보기 <ArrowRight size={18} /></Link>
                </article>

                <article className="account-default-address">
                  <div>
                    <MapPinLine size={25} />
                    <span>기본 배송지</span>
                  </div>
                  {defaultAddress ? (
                    <>
                      <strong>{defaultAddress.label}</strong>
                      <p>{defaultAddress.address} {defaultAddress.detail}</p>
                      <small>{defaultAddress.recipient} {defaultAddress.phone}</small>
                    </>
                  ) : (
                    <>
                      <strong>아직 저장된 배송지가 없어요.</strong>
                      <p>자주 받는 주소를 등록하면 주문할 때 더 빠르게 입력할 수 있습니다.</p>
                    </>
                  )}
                  <button type="button" onClick={() => setSection("addresses")}>
                    {defaultAddress ? "배송지 관리" : "배송지 추가"} <ArrowRight size={18} />
                  </button>
                </article>
              </div>

              <div className="account-overview-actions">
                <button type="button" onClick={() => setSection("profile")}>
                  <UserCircle size={22} />
                  <span><strong>내 정보 확인</strong><small>이름과 연락처를 관리합니다.</small></span>
                  <ArrowRight size={19} />
                </button>
                <button type="button" onClick={() => setSection("addresses")}>
                  <MapPinLine size={22} />
                  <span><strong>배송지 관리</strong><small>{addresses.length}개의 배송지가 저장되어 있습니다.</small></span>
                  <ArrowRight size={19} />
                </button>
              </div>
            </section>
          )}

          {section === "profile" && (
            <section className="account-management-section" aria-labelledby="profile-title">
              <div className="account-section-head">
                <div>
                  <h2 id="profile-title">내 정보 관리</h2>
                  <p>배송과 주문 안내에 사용할 정보를 입력해 주세요.</p>
                </div>
              </div>

              <form className="account-management-form" onSubmit={(event) => void saveProfile(event)}>
                <label>
                  <span>이름</span>
                  <input
                    required
                    autoComplete="name"
                    value={profile.name}
                    onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                  />
                </label>
                <label>
                  <span>이메일</span>
                  <input value={profile.email} readOnly autoComplete="email" />
                  <small>Google 계정 이메일은 로그인 설정에서 변경할 수 있습니다.</small>
                </label>
                <label>
                  <span>휴대폰 번호</span>
                  <input
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="010-0000-0000"
                    value={profile.phone}
                    onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))}
                  />
                </label>
                <label className="account-marketing-check">
                  <input
                    type="checkbox"
                    checked={profile.marketing}
                    onChange={(event) => setProfile((current) => ({ ...current, marketing: event.target.checked }))}
                  />
                  <span>신상품과 DROP 소식을 이메일로 받기</span>
                </label>
                <button className="account-save-button" type="submit" disabled={saving}>
                  {saving ? "저장 중" : "변경사항 저장"}
                </button>
              </form>
            </section>
          )}

          {section === "addresses" && (
            <section className="account-management-section" aria-labelledby="addresses-title">
              <div className="account-section-head address-section-head">
                <div>
                  <h2 id="addresses-title">배송지 관리</h2>
                  <p>자주 쓰는 주소를 등록하고 기본 배송지를 선택하세요.</p>
                </div>
                <button type="button" onClick={() => setAddressEditor(makeEmptyAddress())}>
                  <Plus size={19} weight="bold" /> 새 배송지
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="account-address-empty">
                  <MapPinLine size={34} />
                  <h3>저장된 배송지가 없습니다.</h3>
                  <p>첫 배송지를 등록하면 주문할 때 바로 불러올 수 있어요.</p>
                  <button type="button" onClick={() => setAddressEditor(makeEmptyAddress())}>
                    배송지 추가
                  </button>
                </div>
              ) : (
                <div className="account-address-list">
                  {addresses.map((item) => (
                    <article key={item.id} className={item.isDefault ? "default" : ""}>
                      <header>
                        <strong>{item.label}</strong>
                        {item.isDefault && <span>기본 배송지</span>}
                      </header>
                      <p>{item.recipient} <small>{item.phone}</small></p>
                      <address>
                        <span>{item.postcode}</span>
                        {item.address} {item.detail}
                      </address>
                      <div>
                        {!item.isDefault && (
                          <button type="button" onClick={() => void makeDefault(item.id)}>기본 배송지로</button>
                        )}
                        <button type="button" onClick={() => setAddressEditor({ ...item })}>
                          <PencilSimple size={17} /> 수정
                        </button>
                        <button type="button" className="delete" onClick={() => void removeAddress(item.id)}>
                          <Trash size={17} /> 삭제
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {addressEditor && (
        <div className="account-address-modal" role="dialog" aria-modal="true" aria-labelledby="address-modal-title">
          <button className="account-address-backdrop" type="button" onClick={() => setAddressEditor(null)} aria-label="배송지 창 닫기" />
          <section>
            <header>
              <div>
                <span>ADDRESS</span>
                <h2 id="address-modal-title">배송지 입력</h2>
              </div>
              <button type="button" onClick={() => setAddressEditor(null)} aria-label="닫기"><X size={23} /></button>
            </header>

            <form onSubmit={(event) => void saveAddress(event)}>
              <div className="account-address-form-grid">
                <label>
                  <span>배송지 이름</span>
                  <input
                    autoFocus
                    required
                    placeholder="집, 회사"
                    value={addressEditor.label}
                    onChange={(event) => setAddressEditor((current) => current ? { ...current, label: event.target.value } : current)}
                  />
                </label>
                <label>
                  <span>받는 사람</span>
                  <input
                    required
                    autoComplete="name"
                    value={addressEditor.recipient}
                    onChange={(event) => setAddressEditor((current) => current ? { ...current, recipient: event.target.value } : current)}
                  />
                </label>
                <label className="full">
                  <span>연락처</span>
                  <input
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="010-0000-0000"
                    value={addressEditor.phone}
                    onChange={(event) => setAddressEditor((current) => current ? { ...current, phone: event.target.value } : current)}
                  />
                </label>
                <KakaoAddressFields
                  idPrefix="saved-address"
                  postcode={addressEditor.postcode}
                  address={addressEditor.address}
                  onPostcodeChange={(value) => setAddressEditor((current) => current ? { ...current, postcode: value } : current)}
                  onAddressChange={(value) => setAddressEditor((current) => current ? { ...current, address: value } : current)}
                  detailInputRef={addressDetailRef}
                />
                <label className="full">
                  <span>상세 주소</span>
                  <input
                    ref={addressDetailRef}
                    required
                    autoComplete="address-line2"
                    placeholder="동, 호수 등 상세 주소"
                    value={addressEditor.detail}
                    onChange={(event) => setAddressEditor((current) => current ? { ...current, detail: event.target.value } : current)}
                  />
                </label>
                <label className="account-default-check full">
                  <input
                    type="checkbox"
                    checked={addressEditor.isDefault}
                    onChange={(event) => setAddressEditor((current) => current ? { ...current, isDefault: event.target.checked } : current)}
                  />
                  <span>기본 배송지로 설정</span>
                </label>
              </div>

              <footer>
                <button type="button" onClick={() => setAddressEditor(null)}>취소</button>
                <button type="submit" disabled={saving}>{saving ? "저장 중" : "배송지 저장"}</button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
