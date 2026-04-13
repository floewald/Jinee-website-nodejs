import Image from "next/image";
import { css, cx } from "@/styled-system/css";
import { ABOUT_PAGE_THEME } from "@/lib/constants";

const aboutContainer = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "2.5rem",
  alignItems: "flex-start",
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "2rem 1rem",
});

const aboutImage = css({
  flex: "0 0 auto",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
});

const avatar = css({
  display: "block",
  width: "auto",
  height: "clamp(480px, 50vh, 480px)",
  maxWidth: "100%",
  objectFit: "cover",
  borderRadius: "8px",
});

const aboutText = css({
  flex: "1 1 350px",
  "& p": {
    color: "rgba(255,255,255,0.88)",
    fontSize: "1rem",
    lineHeight: "1.6",
    paddingBottom: "12px",
    maxWidth: "none",
  },
  "& h2": {
    fontSize: "clamp(1.25rem, 2.5vw, 2rem)",
    borderBottom: "none",
    paddingBottom: "0",
    marginBottom: "1.2em",
    color: "#fff",
  },
});

const aboutChinese = css({
  marginTop: "2rem",
  fontSize: "1rem",
  color: "rgba(255,255,255,0.88)",
  "& p": { color: "rgba(255,255,255,0.88)" },
});

export default function AboutSection() {
  return (
    <section id="about" className={ABOUT_PAGE_THEME}>
      <div className={cx(aboutContainer, "container")}>
        <div className={aboutImage}>
          <Image
            className={avatar}
            src="/assets/photos/GOA05725-1.webp"
            alt="Jinee Chen portrait"
            width={520}
            height={520}
            loading="lazy"
            unoptimized
          />
        </div>

        <div className={aboutText}>
          <h2>Video Producer | Photographer</h2>
          <p>📍 Location: Singapore 🇸🇬 &amp; Taipei 🇹🇼</p>
          <p>
            Hello, I&apos;m Jinee. Nice to meet you here. :)<br />
            I&apos;m a professional photographer &amp; videographer with over 15
            years of experience creating stunning visual stories around the
            world. I specialise in capturing lifestyle, travel, and destination
            content through both photography and motion videos, helping brands
            and individuals preserve unforgettable moments.{" "}
            Passionate about storytelling and natural light, I transform real
            experiences into cinematic visuals that engage audiences and inspire
            wanderlust.{" "}
            Let&apos;s create beautiful memories on your next adventure — DM for
            collaborations &amp; bookings!
          </p>

          <div className={aboutChinese} lang="zh-Hant">
            <p>
              哈囉！我是Jinee，很高興在此與您相遇 :)<br />
              我專精於透過攝影捕捉生活風格，並協助品牌用影像說故事。<br />
              我將真實體驗轉化為具電影質感的視覺作品，引領觀眾沉浸其中並激發探索渴望。<br />
              歡迎來信洽詢合作—讓我們一起共創美好回憶！
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
