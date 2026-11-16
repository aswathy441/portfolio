"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { S } from "../lib/state";
const Scene = dynamic(() => import("../components/Scene"), { ssr: false });

// 3D house "camera" keyframes per section (x offset, y offset, rotation, scale, night 0..1)
const K = {
  hero: { x: 2.6, y: 0, ry: 0.5, s: 1, n: 0 }, about: { x: -2.8, y: 0, ry: 2.4, s: 0.85, n: 0 },
  services: { x: 2.9, y: 0, ry: 3.8, s: 0.8, n: 0 }, projects: { x: 0, y: -3.4, ry: 5, s: 0.55, n: 0 },
  process: { x: 2.7, y: 0, ry: 5.6, s: 1, n: 0 }, why: { x: -2.8, y: 0, ry: 7, s: 0.85, n: 0.4 },
  testi: { x: 0, y: -1.6, ry: 8, s: 0.6, n: 0.7 }, contact: { x: 2.8, y: 0, ry: 9.4, s: 0.9, n: 1 },
};
const services = [
  ["01", "Residential Construction", "Bespoke villas and family homes, from foundation to the final finish."],
  ["02", "Commercial Buildings", "Offices, retail and hospitality spaces engineered for scale."],
  ["03", "Interior Design", "Light-filled interiors with custom joinery and curated materials."],
  ["04", "Renovation", "Respectful restoration and modern upgrades for existing homes."],
];
const projects = [
  { name: "Aurum Villa", cat: "Residential", loc: "Whitefield, Bengaluru", area: "6,200 sq ft", year: 2025, img: "/images/p1.jpg" },
  { name: "Onyx Residence", cat: "Residential", loc: "Indiranagar, Bengaluru", area: "4,800 sq ft", year: 2024, img: "/images/p2.jpg" },
  { name: "Meridian Tower", cat: "Commercial", loc: "MG Road, Bengaluru", area: "32,000 sq ft", year: 2025, img: "/images/p3.jpg" },
  { name: "Terra Revival", cat: "Renovation", loc: "Malleshwaram, Bengaluru", area: "3,400 sq ft", year: 2023, img: "/images/p4.jpg" },
];
const steps = [
  ["Consult & Design", "Site study, concept sketches and immersive 3D walkthroughs."],
  ["Foundation", "Soil testing, excavation and a reinforced concrete base."],
  ["Structure", "Columns, slabs and walls rise with daily quality checks."],
  ["Roof & Interiors", "Roofing, glazing, electrical, plumbing and joinery."],
  ["Landscape & Handover", "Pool, gardens, final inspection — and your keys."],
];
const stats = [[250, "+", "Projects delivered"], [18, "", "Years of experience"], [120, "+", "Awards & features"], [98, "%", "Client satisfaction"]];
const reviews = [
  ["They turned our sketches into a home better than we imagined, on time and on budget.", "Ananya & Rohit", "Aurum Villa"],
  ["Meticulous, transparent and creative. Every milestone was documented beautifully.", "Karthik S.", "Meridian Tower"],
  ["Our 40-year-old house feels brand new yet still carries its soul.", "Meera Iyer", "Terra Revival"],
];
const links = [["about", "About"], ["services", "Services"], ["projects", "Projects"], ["process", "Process"], ["contact", "Contact"]];
const words = (t) => t.split(" ").map((w, i) => <span className="mask" key={i}><span className="w">{w}&nbsp;</span></span>);

export default function Home() {
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState(null);
  const [rev, setRev] = useState(0);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.08 });
    window.__lenis = lenis; lenis.stop();
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);

    const mm = gsap.matchMedia();
    // Pinned horizontal project gallery (desktop)
    mm.add("(min-width: 900px)", () => {
      const track = document.querySelector(".h-track");
      gsap.to(track, { x: () => -(track.scrollWidth - window.innerWidth), ease: "none",
        scrollTrigger: { trigger: ".h-wrap", pin: true, scrub: 1, end: () => "+=" + track.scrollWidth, invalidateOnRefresh: true } });
    });

    const ctx = gsap.context(() => {
      // Preloader: the 3D house builds as the counter climbs
      const o = { v: 0 };
      gsap.timeline()
        .to(o, { v: 100, duration: 3, ease: "power2.inOut", onUpdate: () => { S.buildT = o.v / 100; document.querySelector(".pl-num").textContent = Math.round(o.v); } })
        .to(".pl-in", { opacity: 0, y: -20, duration: 0.5 })
        .to(".preloader", { yPercent: -100, duration: 1, ease: "power4.inOut", onStart: () => { S.buildT = 1; } })
        .add(() => { lenis.start(); ScrollTrigger.refresh(); })
        .from(".hero .w", { yPercent: 120, rotateX: -60, stagger: 0.07, duration: 1, ease: "power4.out" }, "-=0.5")
        .from(".hero .fade", { y: 30, opacity: 0, stagger: 0.12 }, "-=0.6")
        .from(".nav", { yPercent: -100, opacity: 0 }, "-=0.8");

      // 3D house keyframes follow the active section
      gsap.utils.toArray("[data-sec]").forEach((el) =>
        ScrollTrigger.create({ trigger: el, start: "top 55%", end: "bottom 55%", onToggle: (s) => { if (s.isActive) S.t = K[el.dataset.sec]; } }));
      // Process: house un-builds on approach, then rebuilds step by step
      ScrollTrigger.create({ trigger: ".process", start: "top bottom", end: "bottom 55%",
        onUpdate: (s) => { const p = s.progress; S.buildT = p < 0.25 ? 1 - (p / 0.25) * 0.97 : 0.03 + ((p - 0.25) / 0.75) * 0.97; },
        onLeave: () => { S.buildT = 1; }, onLeaveBack: () => { S.buildT = 1; } });
      gsap.utils.toArray(".pstep").forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 55%", end: "bottom 55%", toggleClass: { targets: el, className: "on" } }));

      // Reveals
      gsap.utils.toArray(".reveal").forEach((el) => gsap.from(el, { y: 60, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
      gsap.utils.toArray(".title .w").forEach((el) => gsap.from(el, { yPercent: 110, rotateX: -80, transformOrigin: "0 100%", duration: 1, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 92%" } }));
      gsap.utils.toArray(".img-reveal").forEach((el) => gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.4, ease: "power4.inOut", scrollTrigger: { trigger: el, start: "top 85%" } }));
      gsap.utils.toArray("[data-speed]").forEach((el) => gsap.to(el, { yPercent: -parseFloat(el.dataset.speed) * 40, ease: "none", scrollTrigger: { trigger: el, scrub: true } }));
      gsap.to(".float", { y: -16, rotate: 1.5, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });
      gsap.utils.toArray(".count").forEach((el) => { const c = { v: 0 }; gsap.to(c, { v: +el.dataset.to, duration: 2.2, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%" }, onUpdate: () => (el.textContent = Math.round(c.v)) }); });
      gsap.to(".big-foot", { xPercent: -15, ease: "none", scrollTrigger: { trigger: "footer", scrub: true, start: "top bottom" } });
    });

    // Pointer: 3D parallax, cursor, magnetic buttons, tilt + glare
    const mv = (e) => {
      S.mx = e.clientX / innerWidth - 0.5; S.my = e.clientY / innerHeight - 0.5;
      gsap.to(".cur", { x: e.clientX, y: e.clientY, duration: 0.1 }); gsap.to(".cur-r", { x: e.clientX, y: e.clientY, duration: 0.4 });
      document.body.classList.toggle("hov", !!e.target.closest?.("a,button,.tilt,input,select,textarea"));
      const t = e.target.closest?.(".tilt");
      if (t) { const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        t.style.setProperty("--mx", x * 100 + "%"); t.style.setProperty("--my", y * 100 + "%");
        gsap.to(t, { rotateY: (x - 0.5) * 18, rotateX: -(y - 0.5) * 18, transformPerspective: 900, duration: 0.4 }); }
      const m = e.target.closest?.(".mag");
      if (m) { const r = m.getBoundingClientRect(); gsap.to(m, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.3 }); }
    };
    const out = (e) => {
      const t = e.target.closest?.(".tilt"); if (t && !t.contains(e.relatedTarget)) gsap.to(t, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1,0.5)" });
      const m = e.target.closest?.(".mag"); if (m && !m.contains(e.relatedTarget)) gsap.to(m, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
    };
    document.addEventListener("mousemove", mv); document.addEventListener("mouseout", out);
    return () => { document.removeEventListener("mousemove", mv); document.removeEventListener("mouseout", out); ctx.revert(); mm.revert(); gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);

  useEffect(() => { const t = setInterval(() => setRev((r) => (r + 1) % reviews.length), 5500); return () => clearInterval(t); }, []);
  useEffect(() => { gsap.fromTo(".review", { rotationX: -50, y: 30, opacity: 0, transformPerspective: 900 }, { rotationX: 0, y: 0, opacity: 1, duration: 0.9, ease: "back.out(1.4)" }); }, [rev]);

  const go = (id) => (e) => { e.preventDefault(); setMenu(false); window.__lenis?.scrollTo(`#${id}`, { offset: -70, duration: 1.8 }); };

  return (
    <>
      <Scene />
      <div className="cur" /><div className="cur-r" />
      <div className="preloader"><div className="pl-in"><div className="pl-num">0</div><p>Building your experience</p><div className="pl-bar" /></div></div>

      <header className="nav">
        <a href="#top" className="logo" onClick={go("top")}>LUX<b>BUILD</b></a>
        <nav className={menu ? "open" : ""}>{links.map(([id, l]) => <a key={id} href={`#${id}`} onClick={go(id)}>{l}</a>)}</nav>
        <a href="#contact" onClick={go("contact")} className="btn sm mag">Get a quote</a>
        <button className={`burger ${menu ? "x" : ""}`} aria-label="Menu" onClick={() => setMenu(!menu)}><i /><i /></button>
      </header>

      <main>
        <section className="hero" id="top" data-sec="hero">
          <div className="col-l">
            <p className="eyebrow fade"><span className="dot" /> Architecture · Construction · Interiors</p>
            <h1><div>{words("We build")}</div><div>{words("tomorrow’s")}</div><div className="ital">{words("luxury homes")}</div></h1>
            <p className="lead fade">Award-winning design and obsessive craft — explore your future home in 3D before the first brick is laid.</p>
            <div className="row fade"><a href="#projects" onClick={go("projects")} className="btn mag">View projects</a><a href="#contact" onClick={go("contact")} className="btn ghost mag">Book consultation</a></div>
          </div>
          <div className="hero-meta fade"><b>250+</b><span>homes delivered</span></div>
          <div className="scroll-hint fade">Scroll ↓ Move your mouse</div>
        </section>

        <div className="marquee"><div>{Array(4).fill("ARCHITECTURE ✦ CONSTRUCTION ✦ INTERIORS ✦ RENOVATION ✦ ").join("")}</div></div>

        <section className="about" id="about" data-sec="about">
          <div className="col-l portrait-wrap">
            <div className="portrait tilt float" data-speed="0.3"><img className="img-reveal" src="/images/architect.jpg" alt="Ar. Arjun Rao" /><span className="badge glass">18<small>yrs</small></span></div>
          </div>
          <div className="col-r glass-m">
            <p className="eyebrow reveal">About the architect</p>
            <h2 className="title">{words("Ar. Arjun Rao")}</h2>
            <p className="reveal">With 18 years shaping Bengaluru’s skyline, Arjun blends modernist clarity with warm, tactile materials. Every plot is a story — light, air and landscape first, walls second.</p>
            <p className="reveal">Licensed by the Council of Architecture, featured in leading design journals and trusted by over 250 families.</p>
          </div>
        </section>

        <section className="services" id="services" data-sec="services">
          <div className="col-l">
            <p className="eyebrow reveal">What we do</p>
            <h2 className="title">{words("Our services")}</h2>
            <div className="bento">
              {services.map(([n, t, d]) => (
                <article className="card tilt reveal" key={n} style={{ backgroundImage: `linear-gradient(transparent 20%,#07070aee), url(/images/s${+n}.jpg)` }}>
                  <span>{n}</span><h3>{t}</h3><p>{d}</p>
                </article>))}
            </div>
          </div>
        </section>

        <section className="projects" id="projects" data-sec="projects">
          <div className="h-wrap"><div className="h-track">
            <div className="h-intro"><p className="eyebrow">Portfolio</p><h2 className="title big">{words("Featured projects")}</h2><p>Drag through our recent work →</p></div>
            {projects.map((p) => (
              <article className="hproj tilt" key={p.name} onClick={() => setOpen(p)}>
                <img src={p.img} alt={p.name} />
                <div className="hinfo"><small>{p.cat} · {p.year}</small><h3>{p.name}</h3><p>{p.loc} · {p.area}</p><span>View project →</span></div>
              </article>))}
          </div></div>
        </section>
        {open && (
          <div className="lightbox" onClick={() => setOpen(null)}>
            <div className="lb-box glass" onClick={(e) => e.stopPropagation()}>
              <button className="lb-x" onClick={() => setOpen(null)}>×</button>
              <img src={open.img} alt={open.name} /><h3>{open.name}</h3><p>{open.cat} · {open.loc}</p><p>Built area {open.area} · Completed {open.year}</p>
            </div>
          </div>)}

        <section className="process" id="process" data-sec="process">
          <div className="col-l">
            <p className="eyebrow reveal">How we build</p>
            <h2 className="title">{words("Watch it rise")}</h2>
            {steps.map(([t, d], i) => (<div className="pstep glass" key={t}><em>0{i + 1}</em><div><h3>{t}</h3><p>{d}</p></div></div>))}
          </div>
        </section>

        <section className="why" id="why" data-sec="why">
          <div className="col-l">
            <h2 className="title">{words("Why choose us")}</h2>
            <div className="stats">{stats.map(([n, s, l]) => (<div className="stat glass tilt reveal" key={l}><b><span className="count" data-to={n}>0</span>{s}</b><span>{l}</span></div>))}</div>
            <ul className="ach reveal"><li>In-house architects, engineers and site managers</li><li>Fixed-price contracts with weekly progress reports</li><li>10-year structural warranty on every build</li></ul>
          </div>
        </section>

        <section className="testi" data-sec="testi">
          <p className="eyebrow reveal">Client voices</p>
          <div className="review glass">
            <img className="avatar" src={`/images/t${rev + 1}.jpg`} alt="" />
            <blockquote>“{reviews[rev][0]}”</blockquote>
            <cite>{reviews[rev][1]} — <small>{reviews[rev][2]}</small></cite>
          </div>
          <div className="dots">{reviews.map((_, i) => <button key={i} aria-label={`Review ${i + 1}`} className={i === rev ? "on" : ""} onClick={() => setRev(i)} />)}</div>
        </section>

        <section className="contact" id="contact" data-sec="contact">
          <div className="col-l glass-m">
            <h2 className="title">{words("Let’s build yours")}</h2>
            <p className="reveal">Tell us about your plot and your dream. We reply within one working day.</p>
            <ul className="info reveal"><li>📍 12, Design District, Bengaluru 560001</li><li>📞 +91 98765 43210</li><li>✉️ studio@luxbuild.in</li><li>🕘 Mon–Sat, 9:30–6:30</li></ul>
          </div>
          <form className="glass reveal" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            {sent ? <p className="ok">Thank you! We’ll confirm your appointment shortly.</p> : (<>
              <input required placeholder="Full name" /><input required type="email" placeholder="Email" /><input required type="tel" placeholder="Phone" />
              <select defaultValue=""><option value="" disabled>Service</option>{services.map((s) => <option key={s[0]}>{s[1]}</option>)}</select>
              <input required type="date" /><textarea rows="3" placeholder="Tell us about your project" />
              <button className="btn mag">Request appointment</button></>)}
          </form>
        </section>
      </main>

      <footer>
        <div className="big-foot">LUXBUILD · LUXBUILD · LUXBUILD</div>
        <div className="foot-row"><p>© {new Date().getFullYear()} LuxBuild Architects. Luxury architecture & construction.</p>
          <div className="soc">{["Instagram", "LinkedIn", "Pinterest", "YouTube"].map((s) => <a key={s} href="#">{s}</a>)}</div></div>
      </footer>
    </>
  );
}
