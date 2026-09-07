"use client";

import type { CSSProperties } from "react";
import { AD_SCENES } from "@/lib/ad-scenes";

export { AD_SCENES };

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
          {scene.vibe === "fivem" && <>
            <div className="term">
              <div className="term-bar"><i /><i /><i /><span>server.cfg</span></div>
              <p className="term-line l1">ensure my_script</p>
              <p className="term-line l2">[script] loaded ✓</p>
              <p className="term-line l3">[vennet] order #1042 → delivered</p>
              <p className="term-line l4">[vennet] order #1043 → delivered</p>
            </div>
            <div className="badge-sold">SOLD ×2</div>
          </>}
          {scene.vibe === "discord" && <>
            <div className="dc-window">
              <div className="dc-msg m1"><b>buyer</b> just bought <em>TicketBot Pro</em></div>
              <div className="dc-msg m2"><b>vennet</b> files + setup guide delivered ✓</div>
              <div className="dc-msg m3"><b>buyer</b> already running. W</div>
            </div>
            <div className="dc-bot">BOT</div>
          </>}
          {scene.vibe === "payout" && <>
            <div className="pay-card">
              <span className="pay-label">available balance</span>
              <span className="pay-amount">$<span className="pay-num" /></span>
              <span className="pay-foot">Powered by Stripe · next payout Friday</span>
            </div>
            <div className="pay-pill p1">+$29</div><div className="pay-pill p2">+$12</div><div className="pay-pill p3">+$45</div>
          </>}
          {scene.vibe === "steps" && <>
            <div className="step s1"><i>1</i>Join free</div>
            <div className="step s2"><i>2</i>Upload your offer</div>
            <div className="step s3"><i>3</i>Share your link</div>
            <div className="step-done">✓ live</div>
          </>}
          {scene.vibe === "dm" && <>
            <div className="dm-bubble d1">u paid yet??</div>
            <div className="dm-bubble d2">send file pls</div>
            <div className="dm-bubble d3">bro where&apos;s my money</div>
            <div className="dm-x">✕</div>
            <div className="dm-fix">vennet · paid + delivered ✓</div>
          </>}
          {scene.vibe === "trust" && <>
            <div className="trust-card">
              <div className="trust-avatar">M</div>
              <div><div className="trust-name">magrostudios <span>✓ verified</span></div><div className="trust-sub">FiveM · Bots · UI kits</div></div>
            </div>
            <div className="trust-item t1">✓ instant delivery</div><div className="trust-item t2">✓ saved to library</div><div className="trust-item t3">✓ secure checkout</div>
          </>}
          {scene.vibe === "free" && <>
            <div className="price-tag"><span className="price-old">$29/mo</span><span className="price-new">$0</span><span className="price-sub">to open your storefront</span></div>
            <div className="price-spark sp1">✦</div><div className="price-spark sp2">✦</div>
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
        .term{position:absolute;inset:.9rem;border-radius:.8rem;background:#020a08;border:1px solid rgba(110,231,183,.3);padding:.6rem .8rem;font-family:ui-monospace,monospace;font-size:.68rem;color:#a7f3d0}.term-bar{display:flex;align-items:center;gap:.3rem;margin-bottom:.5rem;font-size:.55rem;color:#64748b}.term-bar i{width:.45rem;height:.45rem;border-radius:99px;background:#334155}.term-bar span{margin-left:.4rem}.term-line{margin:.28rem 0;white-space:nowrap;overflow:hidden;animation:type 6s steps(28) infinite;animation-play-state:var(--play)}.l1{color:#fff}.l2{animation-delay:.7s}.l3{color:#6ee7b7;animation-delay:1.6s}.l4{color:#6ee7b7;animation-delay:2.4s}.badge-sold{position:absolute;right:1.2rem;bottom:1.3rem;padding:.4rem .7rem;border-radius:.6rem;background:#fef08a;color:#0f172a;font-size:.7rem;font-weight:900;transform:rotate(6deg);animation:message 6s ease-in-out infinite;animation-delay:.9s;animation-play-state:var(--play)}
        .dc-window{position:absolute;inset:.9rem 1rem;display:flex;flex-direction:column;gap:.5rem;justify-content:center}.dc-msg{padding:.5rem .7rem;border-radius:.7rem;background:#2b2d31;color:#dbdee1;font-size:.68rem;line-height:1.3;animation:message 6s ease-in-out infinite;animation-play-state:var(--play)}.dc-msg b{color:#fff;margin-right:.3rem}.dc-msg em{color:#6ee7b7;font-style:normal;font-weight:800}.m1{animation-delay:-.2s}.m2{background:#0f3d2e;color:#d1fae5;animation-delay:.3s}.m3{animation-delay:.8s}.dc-bot{position:absolute;right:.9rem;top:.7rem;padding:.2rem .45rem;border-radius:.35rem;background:#5865f2;color:#fff;font-size:.55rem;font-weight:900;letter-spacing:.08em;animation:dot 2.2s ease-in-out infinite;animation-play-state:var(--play)}
        .pay-card{position:absolute;left:1rem;right:1rem;top:1.3rem;display:flex;flex-direction:column;gap:.15rem;padding:.9rem 1rem;border-radius:1rem;background:#fff;color:#0f172a;animation:enter 6s cubic-bezier(.22,1,.36,1) infinite;animation-play-state:var(--play)}.pay-label{font-size:.6rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#64748b}.pay-amount{font-size:2.3rem;font-weight:900;letter-spacing:-.05em;line-height:1}.pay-num::after{content:"0";animation:count 6s steps(1) infinite;animation-play-state:var(--play)}.pay-foot{margin-top:.3rem;font-size:.6rem;color:#475569}.pay-pill{position:absolute;bottom:1rem;padding:.4rem .7rem;border-radius:999px;background:#6ee7b7;color:#03120d;font-size:.75rem;font-weight:900;animation:rise 6s ease-out infinite;animation-play-state:var(--play)}.p1{left:1rem;animation-delay:.6s}.p2{left:5.4rem;animation-delay:1.3s}.p3{left:9.4rem;animation-delay:2s}
        .step{position:absolute;left:1rem;right:1rem;display:flex;align-items:center;gap:.7rem;padding:.6rem .8rem;border-radius:.8rem;background:#fff;color:#0f172a;font-size:.8rem;font-weight:800;animation:slidein 6s cubic-bezier(.22,1,.36,1) infinite;animation-play-state:var(--play)}.step i{display:grid;place-items:center;width:1.5rem;height:1.5rem;border-radius:99px;background:#6ee7b7;font-style:normal;font-size:.7rem;font-weight:900}.s1{top:1rem}.s2{top:4.2rem;animation-delay:.5s}.s3{top:7.4rem;animation-delay:1s}.step-done{position:absolute;right:1.2rem;bottom:.8rem;padding:.35rem .7rem;border-radius:999px;background:#6ee7b7;color:#03120d;font-size:.7rem;font-weight:900;animation:message 6s ease-in-out infinite;animation-delay:1.6s;animation-play-state:var(--play)}
        .dm-bubble{position:absolute;padding:.5rem .75rem;border-radius:1rem 1rem 1rem .3rem;background:#334155;color:#e2e8f0;font-size:.7rem;font-weight:700;animation:dmfade 6s ease-in-out infinite;animation-play-state:var(--play)}.d1{left:1rem;top:1rem}.d2{left:2rem;top:3.4rem;animation-delay:.35s}.d3{left:1.2rem;top:5.8rem;animation-delay:.7s}.dm-x{position:absolute;right:1.4rem;top:1.6rem;font-size:3.6rem;font-weight:900;color:#f87171;animation:xpop 6s ease-in-out infinite;animation-play-state:var(--play)}.dm-fix{position:absolute;left:1rem;right:1rem;bottom:1rem;padding:.6rem .8rem;border-radius:.8rem;background:#6ee7b7;color:#03120d;font-size:.75rem;font-weight:900;text-align:center;animation:message 6s ease-in-out infinite;animation-delay:1.5s;animation-play-state:var(--play)}
        .trust-card{position:absolute;left:1rem;right:1rem;top:1.1rem;display:flex;align-items:center;gap:.7rem;padding:.7rem .8rem;border-radius:.9rem;background:#fff;color:#0f172a;animation:enter 6s cubic-bezier(.22,1,.36,1) infinite;animation-play-state:var(--play)}.trust-avatar{display:grid;place-items:center;width:2.4rem;height:2.4rem;border-radius:.7rem;background:#d1fae5;font-weight:900;color:#065f46}.trust-name{font-size:.8rem;font-weight:900}.trust-name span{margin-left:.3rem;font-size:.6rem;color:#059669}.trust-sub{font-size:.62rem;color:#64748b}.trust-item{position:absolute;padding:.4rem .7rem;border-radius:999px;background:rgba(110,231,183,.15);border:1px solid rgba(110,231,183,.5);color:#d1fae5;font-size:.68rem;font-weight:800;animation:message 6s ease-in-out infinite;animation-play-state:var(--play)}.t1{left:1rem;bottom:3.4rem;animation-delay:.4s}.t2{right:1rem;bottom:3.4rem;animation-delay:.8s}.t3{left:1rem;bottom:1rem;animation-delay:1.2s}
        .price-tag{position:absolute;inset:1rem;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.2rem;border-radius:1rem;background:#fff;color:#0f172a;animation:enter 6s cubic-bezier(.22,1,.36,1) infinite;animation-play-state:var(--play)}.price-old{position:relative;font-size:1.1rem;font-weight:800;color:#94a3b8}.price-old::after{content:"";position:absolute;left:-.2rem;right:-.2rem;top:50%;height:.18rem;background:#f87171;transform:scaleX(0);transform-origin:left;animation:strike 6s ease-out infinite;animation-delay:.9s;animation-play-state:var(--play)}.price-new{font-size:4.4rem;font-weight:900;line-height:.9;letter-spacing:-.06em;color:#059669;animation:pop 6s cubic-bezier(.22,1,.36,1) infinite;animation-delay:.4s;animation-play-state:var(--play)}.price-sub{font-size:.7rem;font-weight:700;color:#475569}.price-spark{position:absolute;color:#fef08a;font-size:1.8rem;animation:spark 1.7s ease-in-out infinite;animation-play-state:var(--play)}.sp1{right:1.6rem;top:1.4rem}.sp2{left:1.6rem;bottom:1.4rem;animation-delay:-.7s}
        @keyframes type{0%,8%{max-width:0;opacity:0}9%{opacity:1}40%,85%{max-width:100%;opacity:1}100%{opacity:0}}@keyframes count{0%,20%{content:"0"}26%{content:"29"}32%{content:"41"}38%{content:"86"}44%{content:"140"}50%,85%{content:"185"}100%{content:"185"}}@keyframes rise{0%,20%{opacity:0;transform:translateY(30px)}30%,80%{opacity:1;transform:translateY(0)}100%{opacity:0}}@keyframes slidein{0%,10%{opacity:0;transform:translateX(-40px)}24%,82%{opacity:1;transform:translateX(0)}100%{opacity:0}}@keyframes dmfade{0%,10%{opacity:0;transform:translateY(10px)}20%,50%{opacity:1;transform:translateY(0)}62%,100%{opacity:.18}}@keyframes xpop{0%,48%{opacity:0;transform:scale(.3) rotate(-30deg)}58%,85%{opacity:1;transform:scale(1) rotate(0)}100%{opacity:0}}@keyframes strike{0%,18%{transform:scaleX(0)}30%,100%{transform:scaleX(1)}}@keyframes pop{0%,14%{opacity:0;transform:scale(.4)}30%,100%{opacity:1;transform:scale(1)}}
        .find-search { position:absolute;left:1rem;right:1rem;top:1rem;border:1px solid rgba(255,255,255,.28);border-radius:.7rem;padding:.65rem;color:#d1fae5;font-size:.7rem;font-weight:800;animation:search 5.6s ease-in-out infinite;animation-play-state:var(--play)}.find-tile{position:absolute;display:flex;align-items:flex-end;padding:.6rem;border-radius:.85rem;color:#06120e;font-size:.8rem;font-weight:900;line-height:.9;animation:tile 5.6s cubic-bezier(.22,1,.36,1) infinite;animation-play-state:var(--play)}.tile-one{left:1rem;bottom:1.1rem;width:5.4rem;height:5rem;background:#6ee7b7}.tile-two{left:7rem;bottom:1.1rem;width:3.7rem;height:5rem;background:#d1fae5;animation-delay:-.3s}.tile-three{right:1rem;bottom:1.1rem;width:3.3rem;height:5rem;background:#fef08a;animation-delay:-.6s}.find-cursor{position:absolute;right:3.8rem;top:4rem;font-size:2.1rem;color:#fff;animation:cursor 5.6s ease-in-out infinite;animation-play-state:var(--play)}
        @keyframes float{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-12px,16px,0) scale(1.08)}}@keyframes enter{0%,12%{opacity:0;transform:translateY(22px)}24%,80%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-10px)}}@keyframes signal{0%,14%{opacity:0;transform:translateX(-25px)}28%,78%{opacity:1;transform:translateX(0)}100%{opacity:0;transform:translateX(16px)}}@keyframes vpop{0%,28%{opacity:0;transform:translateY(35px) rotate(-12deg) scale(.65)}44%,82%{opacity:1;transform:translateY(0) rotate(-12deg) scale(1)}100%{opacity:0}}@keyframes dot{50%{transform:scale(2.2);opacity:.25}}@keyframes bot{0%,18%{transform:translate(-50%,-50%) scale(.65);opacity:0}32%,80%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{opacity:0}}@keyframes message{0%,32%{opacity:0;transform:translateY(12px) scale(.8)}44%,79%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0}}@keyframes ring{0%{opacity:.8;transform:translate(-50%,-50%) scale(.65)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.7)}}@keyframes drop{0%,14%{opacity:0;transform:translateY(-70px) rotate(-18deg)}32%,80%{opacity:1;transform:translateY(0) rotate(-8deg)}100%{opacity:0;transform:translateY(20px)}}@keyframes line{0%,28%{transform:scaleX(0);transform-origin:left}45%,80%{transform:scaleX(1);transform-origin:left}100%{transform:scaleX(0);transform-origin:right}}@keyframes spark{50%{transform:scale(1.5) rotate(25deg);opacity:.25}}@keyframes search{0%,14%{opacity:0;transform:translateY(-15px)}28%,80%{opacity:1;transform:translateY(0)}100%{opacity:0}}@keyframes tile{0%,25%{opacity:0;transform:translateY(55px) rotate(-9deg)}41%,79%{opacity:1;transform:translateY(0) rotate(0)}100%{opacity:0}}@keyframes mark{0%,14%{opacity:0;transform:translate(-50%,-50%) scale(.4) rotate(-20deg)}30%,82%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(0)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.1)}}@keyframes cursor{0%,39%{opacity:0;transform:translate(-25px,25px)}53%,80%{opacity:1;transform:translate(0,0)}100%{opacity:0}}
      `}</style>
    </div>
  );
}
