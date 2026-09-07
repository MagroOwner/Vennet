"use client";

import type { CSSProperties } from "react";

export const AD_SCENES = [
  {
    eyebrow: "VENNET PRESENTS",
    title: "Build your own lane.",
    body: "Your skills deserve more than a hidden folder.",
    button: "MAKE IT YOURS",
    caption: "CLIP 01 · THE SWITCH-UP",
    vibe: "signal",
  },
  {
    eyebrow: "SELL ON VENNET",
    title: "Let your work work.",
    body: "Bots, automations, designs, tools. Put them where buyers can find them.",
    button: "START SELLING",
    caption: "CLIP 02 · WHILE YOU SLEEP",
    vibe: "bot",
  },
  {
    eyebrow: "CREATOR ENERGY",
    title: "Idea. Drop. Repeat.",
    body: "Turn the thing you make into a storefront people remember.",
    button: "DROP YOUR OFFER",
    caption: "CLIP 03 · MAKE THE DROP",
    vibe: "drop",
  },
  {
    eyebrow: "BUY FROM CREATORS",
    title: "Find your next advantage.",
    body: "Real digital tools from independent creators—ready when you are.",
    button: "EXPLORE VENNET",
    caption: "CLIP 04 · FIND THE EDGE",
    vibe: "find",
  },
  {
    eyebrow: "JOIN FREE TODAY",
    title: "Your work. Your storefront.",
    body: "Sign up in seconds. List in minutes. Get paid through Stripe.",
    button: "VENNETOFFICIAL.VERCEL.APP",
    caption: "CLIP 05 · THE CLOSE",
    vibe: "outro",
  },
] as const;

export const AD_SCENE_WIDTH = 350;
export const AD_SCENE_HEIGHT = Math.round((AD_SCENE_WIDTH * 16) / 9);

export function AdScene({ index, paused = false }: { index: number; paused?: boolean }) {
  const scene = AD_SCENES[Math.min(Math.max(index, 0), AD_SCENES.length - 1)];

  return (
    <div className="ad-scene relative h-full w-full overflow-hidden bg-[#030814] px-6 pb-7 pt-11 text-white" style={{ "--play": paused ? "paused" : "running" } as CSSProperties}>
      <div className="orb orb-one" /><div className="orb orb-two" /><div className="grid-lines" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between text-[10px] font-black tracking-wide text-emerald-100/80">
          <span className="flex items-center gap-1.5"><span className="grid h-5 w-5 place-items-center rounded-md bg-emerald-300 text-[11px] text-slate-950">V</span> vennet</span>
          <span>{String(index + 1).padStart(2, "0")} / {String(AD_SCENES.length).padStart(2, "0")}</span>
        </div>

        <div className={"scene-visual scene-" + scene.vibe}>
          {scene.vibe === "signal" && <>
            <span className="signal-word signal-one">MAKE</span><span className="signal-word signal-two">MOVES</span>
            <span className="signal-dot dot-a" /><span className="signal-dot dot-b" /><span className="signal-dot dot-c" />
            <div className="signal-v">V</div>
          </>}
          {scene.vibe === "bot" && <>
            <div className="bot-core"><span>V</span><i /><i /><i /></div>
            <div className="bot-message msg-one">new order ↗</div><div className="bot-message msg-two">automation live</div>
            <div className="bot-ring ring-one" /><div className="bot-ring ring-two" />
          </>}
          {scene.vibe === "drop" && <>
            <div className="drop-card card-a">IDEA</div><div className="drop-card card-b">DROP</div><div className="drop-card card-c">SOLD</div>
            <div className="drop-line" /><span className="drop-spark spark-a">✦</span><span className="drop-spark spark-b">✦</span>
          </>}
          {scene.vibe === "find" && <>
            <div className="find-search">⌕ &nbsp; find your edge</div>
            <div className="find-tile tile-one">AI<br />TOOLS</div><div className="find-tile tile-two">DESIGN</div><div className="find-tile tile-three">BOTS</div>
            <span className="find-cursor">↗</span>
          </>}
          {scene.vibe === "outro" && <>
            <div className="outro-ring ring-one" /><div className="outro-ring ring-two" />
            <div className="outro-mark">V</div>
            <div className="outro-tag tag-one">sell</div><div className="outro-tag tag-two">buy</div><div className="outro-tag tag-three">grow</div>
          </>}
        </div>

        <div className="ad-copy mt-auto">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-emerald-300">{scene.eyebrow}</p>
          <h2 className="mt-3 text-[2.45rem] font-black leading-[.91] tracking-[-.065em]">{scene.title}</h2>
          <p className="mt-4 max-w-[16rem] text-sm leading-6 text-slate-300">{scene.body}</p>
          <div className="mt-5 inline-flex rounded-xl bg-emerald-300 px-3.5 py-2.5 text-xs font-black tracking-wide text-slate-950">{scene.button} →</div>
        </div>

        <p className="mt-6 text-[9px] font-black tracking-[.16em] text-emerald-200/90">{scene.caption}</p>
      </div>

      <style jsx>{`
        .orb { position:absolute; border-radius:999px; filter:blur(6px); opacity:.62; animation:float 7s ease-in-out infinite; animation-play-state:var(--play); }
        .orb-one { width:13rem; height:13rem; right:-7rem; top:5rem; background:#10b981; } .orb-two { width:9rem; height:9rem; left:-5rem; bottom:13rem; background:#2dd4bf; animation-delay:-3s; }
        .grid-lines { position:absolute; inset:0; opacity:.18; background-image:linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px); background-size:31px 31px; mask-image:linear-gradient(to bottom,black,transparent 82%); }
        .scene-visual { position:relative; height:13.3rem; margin-top:1.6rem; overflow:hidden; border-radius:1.15rem; background:linear-gradient(145deg,rgba(16,185,129,.18),rgba(15,23,42,.35)); border:1px solid rgba(255,255,255,.12); }
        .ad-copy { animation:enter 7s cubic-bezier(.22,1,.36,1) infinite; animation-play-state:var(--play); }
        .signal-word { position:absolute; left:1.2rem; font-size:2.4rem; font-weight:900; line-height:.8; letter-spacing:-.1em; animation:signal 5.8s ease-in-out infinite; animation-play-state:var(--play); } .signal-one { top:2.1rem; color:#fff; } .signal-two { top:4.9rem; color:#6ee7b7; animation-delay:-.35s; } .signal-v { position:absolute; right:1.6rem; bottom:.3rem; color:#5eead4; font-size:7.3rem; font-weight:900; line-height:1; transform:rotate(-12deg); animation:vpop 5.8s ease-in-out infinite; animation-play-state:var(--play); } .signal-dot { position:absolute; width:.55rem; height:.55rem; border-radius:999px; background:#86efac; animation:dot 2.1s ease-in-out infinite; animation-play-state:var(--play); } .dot-a{right:2rem;top:2rem}.dot-b{right:4rem;top:3.6rem;animation-delay:-.6s}.dot-c{right:1.1rem;top:5.6rem;animation-delay:-1.1s;}
        .bot-core { position:absolute; left:50%; top:49%; display:flex; gap:.25rem; align-items:center; justify-content:center; width:5.8rem; height:5.8rem; transform:translate(-50%,-50%); border-radius:1.8rem; color:#03120d; background:#6ee7b7; box-shadow:0 0 55px rgba(52,211,153,.55); animation:bot 4.8s ease-in-out infinite; animation-play-state:var(--play); } .bot-core span{font-size:3rem;font-weight:900}.bot-core i{position:absolute;bottom:1.2rem;width:.28rem;height:.28rem;border-radius:99px;background:#064e3b}.bot-core i:nth-of-type(1){left:1.55rem}.bot-core i:nth-of-type(2){left:2.75rem}.bot-core i:nth-of-type(3){left:3.95rem}.bot-message { position:absolute; padding:.48rem .65rem; border-radius:.65rem; background:#fff; color:#0f172a; font-size:.65rem; font-weight:900; animation:message 4.8s ease-in-out infinite; animation-play-state:var(--play); } .msg-one{right:.8rem;top:1.2rem}.msg-two{left:.7rem;bottom:1.2rem;animation-delay:-.5s}.bot-ring{position:absolute;left:50%;top:49%;border:1px solid rgba(110,231,183,.55);border-radius:999px;transform:translate(-50%,-50%);animation:ring 2.4s ease-out infinite;animation-play-state:var(--play)}.ring-one{width:7rem;height:7rem}.ring-two{width:7rem;height:7rem;animation-delay:-1.2s}
        .drop-card { position:absolute; display:grid; place-items:center; width:5.3rem; height:6.1rem; border-radius:1rem; color:#06120e; font-size:1.05rem; font-weight:900; transform:rotate(-8deg); animation:drop 5.4s cubic-bezier(.22,1,.36,1) infinite; animation-play-state:var(--play); } .card-a{left:1rem;top:2rem;background:#d1fae5}.card-b{left:6rem;top:1rem;background:#6ee7b7;animation-delay:-.35s}.card-c{right:.7rem;top:2.8rem;background:#fef08a;animation-delay:-.7s}.drop-line{position:absolute;left:.9rem;right:.9rem;bottom:1rem;height:.23rem;background:#6ee7b7;animation:line 5.4s ease-in-out infinite;animation-play-state:var(--play)}.drop-spark{position:absolute;color:#fef08a;font-size:1.6rem;animation:spark 1.7s ease-in-out infinite;animation-play-state:var(--play)}.spark-a{right:1.1rem;top:.5rem}.spark-b{left:1rem;bottom:.6rem;animation-delay:-.7s}
        .outro-mark { position:absolute; left:50%; top:50%; display:grid; place-items:center; width:6.6rem; height:6.6rem; transform:translate(-50%,-50%); border-radius:2rem; background:#6ee7b7; color:#03120d; font-size:4rem; font-weight:900; box-shadow:0 0 70px rgba(52,211,153,.6); animation:mark 5.6s cubic-bezier(.22,1,.36,1) infinite; animation-play-state:var(--play); } .outro-ring{position:absolute;left:50%;top:50%;border:1px solid rgba(110,231,183,.5);border-radius:999px;transform:translate(-50%,-50%);animation:ring 2.6s ease-out infinite;animation-play-state:var(--play)}.outro-ring.ring-one{width:8rem;height:8rem}.outro-ring.ring-two{width:8rem;height:8rem;animation-delay:-1.3s}.outro-tag{position:absolute;padding:.45rem .8rem;border-radius:999px;background:#fff;color:#0f172a;font-size:.7rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase;animation:message 5.6s ease-in-out infinite;animation-play-state:var(--play)}.tag-one{left:1rem;top:1.2rem}.tag-two{right:1rem;top:2.4rem;animation-delay:-.4s}.tag-three{left:1.6rem;bottom:1.2rem;animation-delay:-.8s}
        .find-search { position:absolute;left:1rem;right:1rem;top:1rem;border:1px solid rgba(255,255,255,.28);border-radius:.7rem;padding:.65rem;color:#d1fae5;font-size:.7rem;font-weight:800;animation:search 5.6s ease-in-out infinite;animation-play-state:var(--play)}.find-tile{position:absolute;display:flex;align-items:flex-end;padding:.6rem;border-radius:.85rem;color:#06120e;font-size:.8rem;font-weight:900;line-height:.9;animation:tile 5.6s cubic-bezier(.22,1,.36,1) infinite;animation-play-state:var(--play)}.tile-one{left:1rem;bottom:1.1rem;width:5.4rem;height:5rem;background:#6ee7b7}.tile-two{left:7rem;bottom:1.1rem;width:3.7rem;height:5rem;background:#d1fae5;animation-delay:-.3s}.tile-three{right:1rem;bottom:1.1rem;width:3.3rem;height:5rem;background:#fef08a;animation-delay:-.6s}.find-cursor{position:absolute;right:3.8rem;top:4rem;font-size:2.1rem;color:#fff;animation:cursor 5.6s ease-in-out infinite;animation-play-state:var(--play)}
        @keyframes float{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-12px,16px,0) scale(1.08)}}@keyframes enter{0%,12%{opacity:0;transform:translateY(22px)}24%,80%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-10px)}}@keyframes signal{0%,14%{opacity:0;transform:translateX(-25px)}28%,78%{opacity:1;transform:translateX(0)}100%{opacity:0;transform:translateX(16px)}}@keyframes vpop{0%,28%{opacity:0;transform:translateY(35px) rotate(-12deg) scale(.65)}44%,82%{opacity:1;transform:translateY(0) rotate(-12deg) scale(1)}100%{opacity:0}}@keyframes dot{50%{transform:scale(2.2);opacity:.25}}@keyframes bot{0%,18%{transform:translate(-50%,-50%) scale(.65);opacity:0}32%,80%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{opacity:0}}@keyframes message{0%,32%{opacity:0;transform:translateY(12px) scale(.8)}44%,79%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0}}@keyframes ring{0%{opacity:.8;transform:translate(-50%,-50%) scale(.65)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.7)}}@keyframes drop{0%,14%{opacity:0;transform:translateY(-70px) rotate(-18deg)}32%,80%{opacity:1;transform:translateY(0) rotate(-8deg)}100%{opacity:0;transform:translateY(20px)}}@keyframes line{0%,28%{transform:scaleX(0);transform-origin:left}45%,80%{transform:scaleX(1);transform-origin:left}100%{transform:scaleX(0);transform-origin:right}}@keyframes spark{50%{transform:scale(1.5) rotate(25deg);opacity:.25}}@keyframes search{0%,14%{opacity:0;transform:translateY(-15px)}28%,80%{opacity:1;transform:translateY(0)}100%{opacity:0}}@keyframes tile{0%,25%{opacity:0;transform:translateY(55px) rotate(-9deg)}41%,79%{opacity:1;transform:translateY(0) rotate(0)}100%{opacity:0}}@keyframes mark{0%,14%{opacity:0;transform:translate(-50%,-50%) scale(.4) rotate(-20deg)}30%,82%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(0)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.1)}}@keyframes cursor{0%,39%{opacity:0;transform:translate(-25px,25px)}53%,80%{opacity:1;transform:translate(0,0)}100%{opacity:0}}
      `}</style>
    </div>
  );
}
