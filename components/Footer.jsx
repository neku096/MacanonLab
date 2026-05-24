import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <Link className="footer-brand footer-text-brand" href="/" aria-label="トップへ">
        <img
          className="footer-ocean-logo"
          src="/Macanon_Samune/macanon_Logo_transparent.webp"
          alt="macanon"
          width="1370"
          height="408"
          decoding="async"
          loading="lazy"
        />
        <span className="footer-tagline">VRChat 3D衣装・ギミック制作</span>
      </Link>
      <div className="footer-links">
        <a className="footer-pill" href={SITE.boothUrl} target="_blank" rel="noopener noreferrer">
          <span className="footer-pill-icon" aria-hidden="true">
            <img src="/images/link-icons/Booth_logo_footer.webp" alt="" width="26" height="26" loading="lazy" />
          </span>
          <span>BOOTH</span>
        </a>
        <a className="footer-pill" href={SITE.xUrl} target="_blank" rel="noopener noreferrer">
          <span className="footer-pill-icon" aria-hidden="true">
            <img src="/images/link-icons/x_logo-white_footer.webp" alt="" width="22" height="22" loading="lazy" />
          </span>
          <span>X</span>
        </a>
        <Link className="footer-pill" href="/links">
          <span className="footer-pill-icon" aria-hidden="true">
            L
          </span>
          <span>Links</span>
        </Link>
      </div>
    </footer>
  );
}
