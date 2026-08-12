"use client";

import {
  ArrowLeft,
  Bag,
  Heart,
  List,
  MagnifyingGlass,
  Moon,
  Sun,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useStore } from "@/components/commerce/StoreProvider";

const navItems = [
  ["NEW", "/shop?sort=new"],
  ["BEST", "/shop?sort=best"],
  ["CATEGORY", "/shop"],
  ["DROP", "/#weekly-drop"],
  ["ABOUT", "/about"],
];

const mobileMenuPaths = new Set(["/", "/shop", "/about", "/terms", "/privacy", "/partner", "/admin"]);

function normalizeMobilePath(pathname: string | null) {
  if (!pathname) return null;
  const withoutBasePath = pathname.replace(/^\/droproom(?=\/|$)/, "");
  return withoutBasePath || "/";
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount, wishlist } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const mobilePathname = normalizeMobilePath(pathname);
  const usesMobileBackButton = Boolean(mobilePathname && !mobileMenuPaths.has(mobilePathname));

  useEffect(() => {
    const saved = window.localStorage.getItem("drop-room-theme");
    const nextTheme =
      saved === "dark" || saved === "light"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  useEffect(() => {
    if (!searchOpen && !menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [searchOpen, menuOpen]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("drop-room-theme", nextTheme);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/shop?q=${encodeURIComponent(value)}` : "/shop");
    setSearchOpen(false);
  };

  const goBack = () => {
    const cameFromThisSite = document.referrer.startsWith(window.location.origin);
    if (cameFromThisSite) {
      router.back();
      return;
    }
    router.push("/shop");
  };

  return (
    <>
      <header className="site-header">
        <div className="shell header-inner">
          {usesMobileBackButton ? (
            <button
              className="icon-button mobile-back-button"
              type="button"
              aria-label="이전 페이지로"
              onClick={goBack}
            >
              <ArrowLeft size={23} weight="regular" />
            </button>
          ) : (
            <button
              className="icon-button mobile-only"
              type="button"
              aria-label="전체 메뉴 열기"
              onClick={() => setMenuOpen(true)}
            >
              <List size={22} weight="regular" />
            </button>
          )}

          <Link className="brand-home-link" href="/" aria-label="DROP ROOM 홈">
            <BrandLogo variant="header" />
          </Link>

          <nav className="desktop-nav" aria-label="주요 메뉴">
            {navItems.map(([label, href]) => (
              <Link key={label} href={href}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <button
              className="icon-button"
              type="button"
              aria-label="검색 열기"
              onClick={() => setSearchOpen(true)}
            >
              <MagnifyingGlass size={20} />
            </button>
            <button
              className="icon-button desktop-action"
              type="button"
              aria-label={theme === "light" ? "다크 모드" : "라이트 모드"}
              onClick={toggleTheme}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Link className="icon-button desktop-action" href="/wishlist" aria-label="찜">
              <Heart size={20} />
              {wishlist.length > 0 && <span className="count-badge">{wishlist.length}</span>}
            </Link>
            <Link className="icon-button" href="/account" aria-label="로그인 또는 마이페이지">
              <UserCircle size={21} />
            </Link>
            <Link className="icon-button" href="/cart" aria-label={`장바구니 ${cartCount}개`}>
              <Bag size={21} />
              {cartCount > 0 && <span className="count-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="상품 검색">
          <div className="search-panel">
            <div className="search-panel-head">
              <span>SEARCH</span>
              <button className="icon-button" type="button" onClick={() => setSearchOpen(false)} aria-label="검색 닫기">
                <X size={22} />
              </button>
            </div>
            <form className="search-form" onSubmit={submitSearch}>
              <label htmlFor="site-search">찾고 싶은 물건</label>
              <div className="search-field">
                <input
                  id="site-search"
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="노트, 키링, 조명"
                />
                <button type="submit" aria-label="검색">
                  <MagnifyingGlass size={26} />
                </button>
              </div>
            </form>
            <div className="search-suggestions">
              <span>많이 찾는 검색어</span>
              <div>
                {["미니 조명", "코발트", "1만원 선물", "태블릿 파우치"].map((item) => (
                  <button key={item} type="button" onClick={() => setQuery(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button className="overlay-backdrop" type="button" onClick={() => setSearchOpen(false)} aria-label="검색 닫기" />
        </div>
      )}

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="전체 메뉴">
          <div className="mobile-menu-head">
            <Link className="brand-home-link brand-home-link--menu" href="/" aria-label="DROP ROOM 홈" onClick={() => setMenuOpen(false)}>
              <BrandLogo variant="header" />
            </Link>
            <button className="icon-button" type="button" onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기">
              <X size={24} />
            </button>
          </div>
          <nav aria-label="모바일 주요 메뉴">
            {navItems.map(([label, href]) => (
              <Link key={label} href={href} onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="mobile-menu-tools">
            <Link href="/wishlist" onClick={() => setMenuOpen(false)}><Heart size={20} /> 찜</Link>
            <button type="button" onClick={toggleTheme}>{theme === "light" ? <Moon size={20} /> : <Sun size={20} />} 테마</button>
          </div>
        </div>
      )}
    </>
  );
}
