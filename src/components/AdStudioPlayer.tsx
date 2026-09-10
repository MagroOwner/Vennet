"use client";

import { useEffect, useRef, useState } from "react";

const scenes = [
  {
    duration: 3000,
    label: "A MARKETPLACE FOR DIGITAL WORK",
    title: ["TURN YOUR", "SKILLS INTO", "SOMETHING REAL."],
    body: "Templates · code · bots · AI tools · services",
    scene: "opening",
  },
  {
    duration: 4000,
    label: "FOR CREATORS",
    title: ["SELL WHAT", "YOU BUILD."],
    body: "Publish a polished listing. Reach buyers looking for exactly what you make.",
    scene: "selling",
  },
  {
    duration: 4000,
    label: "FOR BUYERS",
    title: ["FIND YOUR", "NEXT EDGE."],
    body: "Discover useful work from independent creators—ready when you are.",
    scene: "buying",
  },
  {
    duration: 4000,
    label: "VENNET",
    title: ["BUY. SELL.", "BUILD."],
    body: "vennetofficial.vercel.app",
    scene: "end",
  },
] as const;

type Scene = (typeof scenes)[number]["scene"];

function OpeningVisual() {
  return <div className="visual opening-visual">
    <div className="arch arch-a" /><div className="arch arch-b" />
    <div className="market-slab">
      <div className="slab-header"><span><i>V</i> vennet</span><b>MARKETPLACE</b></div>
      <div className="slab-title">Good work<br /><em>moves.</em></div>
      <div className="slab-grid">
        <div className="mini-card code-card"><span>{"{ }"}</span><small>CODE</small></div>
        <div className="mini-card bot-card"><span>◉</span><small>BOTS</small></div>
        <div className="mini-card star-card"><span>✦</span><small>AI TOOLS</small></div>
      </div>
    </div>
    <div className="chrome-orb" /><div className="orbit orbit-a" /><div className="orbit orbit-b" />
  </div>;
}

function SellingVisual() {
  return <div className="visual selling-visual">
    <div className="sales-light" /><div className="sales-grid" />
    <div className="listing-panel">
      <div className="panel-top"><span>CREATE A LISTING</span><i>×</i></div>
      <div className="panel-preview"><div className="preview-mark">✦</div><span><b>Your work, clearly presented.</b><small>Give buyers the details they need.</small></span></div>
      <div className="panel-fields"><i /><i /><i /></div>
      <div className="panel-publish">PUBLISH YOUR OFFER <b>↗</b></div>
    </div>
    <div className="sale-chip chip-one">templates</div><div className="sale-chip chip-two">code</div><div className="sale-chip chip-three">bots</div>
    <div className="order-note"><span>●</span> new order</div>
  </div>;
}

function BuyingVisual() {
  return <div className="visual buying-visual">
    <div className="discover-grid" />
    <div className="purchase-card card-main"><div className="card-icon">✦</div><small>FEATURED TOOL</small><b>Workflow<br />Library</b><span>Made by a creator</span><div>VIEW DETAILS <i>↗</i></div></div>
    <div className="purchase-card card-left"><span>{"{ }"}</span><b>Component kit</b><small>CODE</small></div>
    <div className="purchase-card card-right"><span>◉</span><b>Server bot</b><small>AUTOMATION</small></div>
    <div className="cursor-arrow">↗</div><div className="cursor-spark" />
  </div>;
}

function EndVisual() {
  return <div className="visual end-visual">
    <div className="end-ray ray-one" /><div className="end-ray ray-two" /><div className="end-ray ray-three" />
    <div className="end-disc" />
    <div className="vennet-v"><i /><i /></div>
    <div className="end-stars"><span>✦</span><span>✦</span><span>✦</span><span>✦</span></div>
  </div>;
}

function SceneVisual({ scene }: { scene: Scene }) {
  if (scene === "opening") return <OpeningVisual />;
  if (scene === "selling") return <SellingVisual />;
  if (scene === "buying") return <BuyingVisual />;
  return <EndVisual />;
}

export function AdStudioPlayer() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const timers = useRef<number[]>([]);
  const audio = useRef<AudioContext | null>(null);
  const scene = scenes[sceneIndex];

  const stopAudio = () => {
    audio.current?.close().catch(() => undefined);
    audio.current = null;
    window.speechSynthesis?.cancel();
  };

  const stop = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    stopAudio();
    setPlaying(false);
  };

  const playSound = () => {
    const context = new AudioContext();
    audio.current = context;
    const master = context.createGain();
    master.gain.value = 0.045;
    master.connect(context.destination);

    const hit = (at: number, frequency: number, length: number, type: OscillatorType) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, at);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(50, frequency / 1.65), at + length);
      gain.gain.setValueAtTime(0.001, at);
      gain.gain.exponentialRampToValueAtTime(1, at + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, at + length);
      oscillator.connect(gain).connect(master);
      oscillator.start(at);
      oscillator.stop(at + length + 0.03);
    };

    const start = context.currentTime + 0.05;
    Array.from({ length: 20 }, (_, index) => index * 0.75).forEach((beat, index) => {
      hit(start + beat, index % 4 === 0 ? 130 : 196, index % 4 === 0 ? 0.42 : 0.16, index % 4 === 0 ? "sine" : "triangle");
    });
    [3, 7, 11].forEach((beat) => hit(start + beat, 620, 0.55, "sawtooth"));
  };

  const play = () => {
    stop();
    setSceneIndex(0);
    setPlaying(true);

    if (soundOn) {
      playSound();
      const voice = new SpeechSynthesisUtterance(
        "Vennet is where creators sell digital work, and buyers find what helps them build. Sell templates, code, bots, AI tools, and services. Or discover your next advantage. Vennet. Buy, sell, build."
      );
      voice.rate = 1.04;
      voice.pitch = 0.9;
      voice.volume = 0.84;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(voice);
    }

    timers.current = [
      window.setTimeout(() => setSceneIndex(1), 3000),
      window.setTimeout(() => setSceneIndex(2), 7000),
      window.setTimeout(() => setSceneIndex(3), 11000),
      window.setTimeout(() => { stopAudio(); setPlaying(false); }, 15000),
    ];
  };

  useEffect(() => () => { timers.current.forEach((timer) => window.clearTimeout(timer)); stopAudio(); }, []);

  return <section className="ad-studio">
    <div className="studio-bar">
      <div><p>PRIVATE RECORDING STUDIO</p><h1>Vennet brand film</h1><span>15-second 9:16 ad · built for a clean screen recording</span></div>
      <div className="buttons"><button type="button" onClick={() => setSoundOn((value) => !value)}>{soundOn ? "Sound on" : "Sound off"}</button><button type="button" className="play" onClick={playing ? stop : play}>{playing ? "Stop film ■" : "Play full film ▶"}</button></div>
    </div>

    <div className="studio-main">
      <div className="film-stage">
        <div className="phone">
          <div className="camera-island" />
          <div className={"film film-" + scene.scene} key={scene.scene}>
            <div className="film-noise" /><div className="film-glow glow-a" /><div className="film-glow glow-b" />
            <header className="film-header"><span><b>V</b> vennet</span><span>{String(sceneIndex + 1).padStart(2, "0")} / 04</span></header>
            <SceneVisual scene={scene.scene} />
            <footer className="film-copy"><p>{scene.label}</p><h2>{scene.title.map((line) => <span key={line}>{line}</span>)}</h2><div><i />{scene.body}</div></footer>
          </div>
        </div>
      </div>

      <aside className="story">
        <p className="story-label">WHAT THE FILM SAYS</p>
        <div className="story-list">
          {scenes.map((item, index) => <div key={item.scene} className={index === sceneIndex ? "now" : ""}><b>{index === 0 ? "0–3 sec" : index === 1 ? "3–7 sec" : index === 2 ? "7–11 sec" : "11–15 sec"}</b><span>{item.label}</span><small>{item.body}</small></div>)}
        </div>
        <div className="recording-tip"><b>Record it cleanly</b><p>Press Play, select only the phone frame in your screen recorder, then capture the full 15 seconds. Add your own TikTok sound afterward for the strongest result.</p></div>
      </aside>
    </div>

    <style jsx>{`
      .ad-studio{overflow:hidden;border:1px solid #dbe8e1;border-radius:30px;background:#fff;box-shadow:0 30px 85px rgba(6,78,59,.13);color:#0f172a}.studio-bar{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:27px 31px;border-bottom:1px solid #e5eee9;background:linear-gradient(100deg,#fff 20%,#f0fdf4)}.studio-bar p,.story-label{margin:0;color:#047857;font-size:11px;font-weight:950;letter-spacing:.2em}.studio-bar h1{margin:5px 0 3px;font-size:27px;letter-spacing:-.055em}.studio-bar span{color:#64748b;font-size:13px}.buttons{display:flex;gap:9px}.buttons button{border:1px solid #cbd5e1;border-radius:12px;background:#fff;padding:11px 14px;color:#334155;font:inherit;font-size:13px;font-weight:850;cursor:pointer}.buttons .play{border-color:#10b981;background:#10b981;color:#022c22;box-shadow:0 10px 22px rgba(16,185,129,.24)}.studio-main{display:grid;grid-template-columns:minmax(0,1fr) 315px;gap:35px;padding:34px}.film-stage{display:grid;min-height:690px;place-items:center;border-radius:25px;background:radial-gradient(circle at 50% 5%,#bbf7d0 0,transparent 29%),linear-gradient(135deg,#effcf6 0%,#f8fafc 62%,#e2e8f0 100%)}.phone{position:relative;width:min(100%,390px);padding:7px;border-radius:42px;background:#020617;box-shadow:0 35px 58px rgba(15,23,42,.32)}.camera-island{position:absolute;z-index:20;top:10px;left:50%;width:112px;height:21px;border-radius:999px;background:#020617;transform:translateX(-50%)}.film{position:relative;aspect-ratio:9/16;overflow:hidden;border-radius:35px;background:#030815;color:#fff;isolation:isolate}.film-noise{position:absolute;inset:0;z-index:20;opacity:.07;background-image:radial-gradient(rgba(255,255,255,.46) .65px,transparent .65px);background-size:4px 4px;pointer-events:none}.film-glow{position:absolute;border-radius:50%;filter:blur(40px);opacity:.42;animation:glow-drift 8s ease-in-out infinite}.glow-a{top:-100px;right:-80px;width:260px;height:260px;background:#10b981}.glow-b{bottom:120px;left:-120px;width:240px;height:240px;background:#0f766e;animation-delay:-4s}.film-header{position:relative;z-index:30;display:flex;justify-content:space-between;padding:34px 27px 0;color:#d1fae5;font-size:10px;font-weight:800;letter-spacing:.11em}.film-header span:first-child{display:flex;align-items:center;gap:7px;letter-spacing:0}.film-header b{display:grid;place-items:center;width:20px;height:20px;border-radius:7px;background:#a7f3d0;color:#022c22;font-size:12px}.visual{position:absolute;inset:72px 0 172px;z-index:5;perspective:800px}.arch{position:absolute;width:230px;height:230px;border:1px solid rgba(110,231,183,.3);border-radius:50%;animation:spin 9s linear infinite}.arch-a{top:-72px;left:-80px}.arch-b{right:-132px;bottom:-88px;border-width:2px;animation-direction:reverse}.market-slab{position:absolute;top:40px;left:50%;width:285px;height:292px;padding:18px;border:1px solid rgba(236,253,245,.42);border-radius:25px;background:linear-gradient(145deg,rgba(255,255,255,.33),rgba(5,46,38,.26));box-shadow:inset 0 1px 1px rgba(255,255,255,.55),0 28px 55px rgba(0,0,0,.4);backdrop-filter:blur(14px);transform:translateX(-50%) rotateX(8deg) rotateY(-9deg);animation:slab-in 3s cubic-bezier(.16,1,.3,1) both}.slab-header{display:flex;justify-content:space-between;color:#d1fae5;font-size:8px;font-weight:900;letter-spacing:.12em}.slab-header span{display:flex;align-items:center;gap:5px;letter-spacing:0}.slab-header i{display:grid;place-items:center;width:18px;height:18px;border-radius:6px;background:#6ee7b7;color:#022c22;font-size:11px;font-style:normal}.slab-title{margin:27px 0 16px;font-size:35px;font-weight:950;line-height:.85;letter-spacing:-.08em}.slab-title em{color:#6ee7b7;font-style:normal}.slab-grid{display:flex;gap:8px}.mini-card{display:flex;flex:1;flex-direction:column;justify-content:space-between;height:79px;padding:10px;border:1px solid rgba(255,255,255,.26);border-radius:13px;box-shadow:0 9px 18px rgba(0,0,0,.16);font-size:19px;font-weight:950}.mini-card small{color:#d1fae5;font-size:7px;letter-spacing:.09em}.code-card{background:linear-gradient(145deg,#1f2937,#020617)}.bot-card{background:linear-gradient(145deg,#065f46,#047857)}.star-card{background:linear-gradient(145deg,#d1fae5,#6ee7b7);color:#022c22}.star-card small{color:#064e3b}.chrome-orb{position:absolute;right:24px;bottom:32px;width:78px;height:78px;border:1px solid rgba(255,255,255,.8);border-radius:50%;background:linear-gradient(135deg,#f8fafc 0%,#64748b 34%,#d1fae5 54%,#0f766e 100%);box-shadow:inset -12px -12px 18px rgba(0,0,0,.25),inset 9px 8px 12px rgba(255,255,255,.8),0 0 30px rgba(110,231,183,.36);animation:orb-float 4s ease-in-out infinite}.orbit{position:absolute;border:1px solid rgba(110,231,183,.32);border-radius:50%;animation:spin 12s linear infinite}.orbit-a{top:33px;right:18px;width:96px;height:96px}.orbit-b{bottom:42px;left:20px;width:48px;height:48px;animation-direction:reverse}.sales-light{position:absolute;top:-80px;left:50%;width:230px;height:240px;border-radius:50%;background:#10b981;filter:blur(47px);opacity:.42;transform:translateX(-50%)}.sales-grid,.discover-grid{position:absolute;inset:0;opacity:.18;background-image:linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px);background-size:28px 28px;mask-image:linear-gradient(to bottom,black,transparent)}.listing-panel{position:absolute;top:32px;left:50%;width:277px;padding:14px;border:1px solid rgba(236,253,245,.4);border-radius:19px;background:rgba(15,23,42,.58);box-shadow:0 24px 55px rgba(0,0,0,.44);backdrop-filter:blur(15px);transform:translateX(-50%) rotateX(4deg) rotateY(-5deg);animation:panel-in 4s cubic-bezier(.16,1,.3,1) both}.panel-top{display:flex;justify-content:space-between;color:#a7f3d0;font-size:8px;font-weight:900;letter-spacing:.13em}.panel-top i{font-style:normal}.panel-preview{display:flex;gap:10px;align-items:center;margin-top:13px;padding:10px;border-radius:12px;background:linear-gradient(135deg,#d1fae5,#99f6e4)}.preview-mark{display:grid;place-items:center;width:35px;height:35px;border-radius:10px;background:#022c22;color:#6ee7b7;font-size:20px}.panel-preview b{display:block;color:#022c22;font-size:10px;line-height:1.15}.panel-preview small{display:block;margin-top:3px;color:#065f46;font-size:8px;line-height:1.15}.panel-fields{display:grid;gap:7px;margin:13px 0}.panel-fields i{display:block;height:8px;border-radius:99px;background:rgba(226,232,240,.2)}.panel-fields i:nth-child(2){width:78%}.panel-fields i:nth-child(3){width:58%}.panel-publish{padding:10px;border-radius:10px;background:#6ee7b7;color:#022c22;text-align:center;font-size:9px;font-weight:950;letter-spacing:.08em}.panel-publish b{font-size:13px}.sale-chip{position:absolute;padding:7px 10px;border:1px solid rgba(236,253,245,.46);border-radius:99px;background:rgba(6,78,59,.68);box-shadow:0 12px 28px rgba(0,0,0,.25);color:#d1fae5;font-size:10px;font-weight:850;backdrop-filter:blur(7px);animation:chip-in 4s ease both}.chip-one{top:41px;left:17px}.chip-two{right:15px;bottom:70px;animation-delay:.45s}.chip-three{bottom:32px;left:40px;animation-delay:.8s}.order-note{position:absolute;right:17px;top:222px;padding:9px 12px;border-radius:11px;background:#fff;color:#0f172a;font-size:10px;font-weight:900;box-shadow:0 15px 32px rgba(0,0,0,.26);animation:note-in 4s ease both 1s}.order-note span{color:#10b981}.purchase-card{position:absolute;border:1px solid rgba(255,255,255,.42);background:linear-gradient(145deg,rgba(255,255,255,.38),rgba(16,185,129,.12));box-shadow:0 22px 55px rgba(0,0,0,.38);backdrop-filter:blur(14px);animation:card-fly 4s cubic-bezier(.16,1,.3,1) both}.card-main{top:37px;left:50%;display:flex;flex-direction:column;width:215px;height:255px;padding:19px;border-radius:23px;transform:translateX(-50%) rotateY(-5deg)}.card-icon{display:grid;place-items:center;width:46px;height:46px;border-radius:14px;background:#d1fae5;color:#064e3b;font-size:25px}.card-main small{margin-top:22px;color:#a7f3d0;font-size:8px;font-weight:900;letter-spacing:.13em}.card-main b{margin-top:9px;font-size:27px;line-height:.88;letter-spacing:-.07em}.card-main>span{margin-top:8px;color:#cbd5e1;font-size:10px}.card-main>div:last-child{margin-top:auto;padding:10px;border-radius:10px;background:#6ee7b7;color:#022c22;font-size:8px;font-weight:950;letter-spacing:.08em}.card-main>div:last-child i{float:right;font-size:12px;font-style:normal}.card-left,.card-right{display:flex;flex-direction:column;justify-content:flex-end;width:111px;height:135px;padding:13px;border-radius:17px}.card-left{bottom:32px;left:2px;transform:rotate(-16deg);animation-delay:.3s}.card-right{right:1px;bottom:29px;transform:rotate(15deg);animation-delay:.6s}.card-left span,.card-right span{position:absolute;top:14px;color:#a7f3d0;font-size:20px;font-weight:950}.card-left b,.card-right b{font-size:13px;letter-spacing:-.05em}.card-left small,.card-right small{margin-top:4px;color:#a7f3d0;font-size:7px;font-weight:900;letter-spacing:.11em}.cursor-arrow{position:absolute;z-index:10;top:195px;right:78px;color:#fff;font-size:42px;filter:drop-shadow(0 0 12px #6ee7b7);animation:cursor-in 4s ease both 1.1s}.cursor-spark{position:absolute;z-index:9;top:190px;right:81px;width:63px;height:63px;border:2px solid #6ee7b7;border-radius:50%;box-shadow:0 0 22px #6ee7b7;animation:select-pulse 1s ease-in-out infinite}.end-ray{position:absolute;top:-130px;left:50%;width:52px;height:620px;background:linear-gradient(180deg,rgba(110,231,183,.45),transparent 70%);filter:blur(14px);transform-origin:top;animation:ray 4s ease-in-out infinite}.ray-one{transform:rotate(-27deg)}.ray-two{transform:rotate(5deg);animation-delay:-1.2s}.ray-three{transform:rotate(33deg);animation-delay:-2.4s}.end-disc{position:absolute;top:62px;left:50%;width:250px;height:250px;border:1px solid rgba(167,243,208,.35);border-radius:50%;background:radial-gradient(circle,#10b981 0,rgba(16,185,129,.24) 31%,transparent 67%);filter:blur(.1px);transform:translateX(-50%);animation:disc 3s ease-in-out infinite}.vennet-v{position:absolute;z-index:6;top:82px;left:50%;width:174px;height:206px;filter:drop-shadow(0 0 38px rgba(110,231,183,.72));transform:translateX(-50%);animation:v-in 4s cubic-bezier(.16,1,.3,1) both}.vennet-v i{position:absolute;top:11px;width:43px;height:190px;border:2px solid rgba(236,253,245,.72);border-radius:15px;background:linear-gradient(90deg,#047857,#d1fae5 48%,#064e3b);box-shadow:inset 8px 0 16px rgba(255,255,255,.32),inset -8px 0 18px rgba(0,0,0,.3)}.vennet-v i:first-child{left:35px;transform:rotate(-25deg)}.vennet-v i:last-child{right:35px;transform:rotate(25deg)}.end-stars span{position:absolute;color:#d1fae5;font-size:17px;filter:drop-shadow(0 0 10px #6ee7b7);animation:star 1.8s ease-in-out infinite}.end-stars span:nth-child(1){top:39px;left:31px}.end-stars span:nth-child(2){top:82px;right:37px;animation-delay:-.45s}.end-stars span:nth-child(3){bottom:56px;left:50px;animation-delay:-.9s}.end-stars span:nth-child(4){bottom:35px;right:53px;animation-delay:-1.35s}.film-copy{position:absolute;right:25px;bottom:28px;left:25px;z-index:25;animation:copy-in .65s cubic-bezier(.16,1,.3,1) both}.film-copy p{margin:0;color:#6ee7b7;font-size:9px;font-weight:950;letter-spacing:.19em}.film-copy h2{margin:11px 0 14px;font-size:36px;font-weight:950;line-height:.84;letter-spacing:-.075em}.film-copy h2 span{display:block}.film-copy div{display:flex;align-items:center;gap:8px;color:#d1fae5;font-size:10px;font-weight:700}.film-copy div i{width:7px;height:7px;border-radius:50%;background:#6ee7b7;box-shadow:0 0 10px #6ee7b7}.story{display:flex;flex-direction:column;justify-content:center}.story-list{display:grid;gap:8px;margin-top:15px}.story-list>div{padding:13px;border:1px solid #e2e8f0;border-radius:15px;color:#64748b;transition:.2s}.story-list>div.now{border-color:#6ee7b7;background:#ecfdf5;color:#064e3b;box-shadow:0 9px 20px rgba(16,185,129,.11)}.story-list b,.story-list span,.story-list small{display:block}.story-list b{font-size:10px}.story-list span{margin-top:4px;font-size:12px;font-weight:950;letter-spacing:.04em}.story-list small{margin-top:4px;font-size:11px;line-height:1.35}.recording-tip{margin-top:18px;padding:17px;border-radius:17px;background:#061b15;color:#d1fae5;font-size:12px;line-height:1.5}.recording-tip b{display:block;color:#fff;font-size:14px}.recording-tip p{margin:6px 0 0}@keyframes glow-drift{50%{transform:translate(-16px,22px) scale(1.13)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes slab-in{0%{opacity:0;transform:translate(-50%,70px) rotateX(30deg) rotateY(-18deg) scale(.7)}36%,82%{opacity:1;transform:translateX(-50%) rotateX(8deg) rotateY(-9deg) scale(1)}100%{opacity:0;transform:translate(-50%,-25px) scale(.95)}}@keyframes orb-float{50%{transform:translate(-6px,-18px) scale(1.08)}}@keyframes panel-in{0%{opacity:0;transform:translate(-50%,70px) rotateX(28deg) scale(.7)}34%,82%{opacity:1;transform:translateX(-50%) rotateX(4deg) rotateY(-5deg) scale(1)}100%{opacity:0;transform:translate(-50%,-20px) scale(.95)}}@keyframes chip-in{0%,22%{opacity:0;transform:translateY(28px) scale(.7)}42%,82%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0}}@keyframes note-in{0%,27%{opacity:0;transform:translateX(35px) scale(.7)}45%,82%{opacity:1;transform:translateX(0) scale(1)}100%{opacity:0}}@keyframes card-fly{0%{opacity:0;transform:translate3d(0,95px,-120px) scale(.45) rotate(-15deg)}35%,82%{opacity:1}100%{opacity:0;transform:translate3d(0,-85px,90px) scale(1.16) rotate(7deg)}}@keyframes cursor-in{0%,31%{opacity:0;transform:translate(-65px,55px) scale(.55)}54%,82%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0}}@keyframes select-pulse{50%{transform:scale(1.23);opacity:.27}}@keyframes ray{50%{opacity:.24;transform:translateX(35px) rotate(-27deg)}}@keyframes disc{50%{transform:translateX(-50%) scale(1.12);opacity:.72}}@keyframes v-in{0%{opacity:0;transform:translate(-50%,92px) scale(.56)}38%,82%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-16px) scale(.95)}}@keyframes star{50%{transform:scale(2.2) rotate(22deg);opacity:.2}}@keyframes copy-in{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}@media(max-width:800px){.studio-bar{align-items:flex-start;flex-direction:column;padding:22px}.studio-main{grid-template-columns:1fr;padding:18px}.film-stage{min-height:auto;padding:25px 12px}.phone{max-width:340px}.film-copy h2{font-size:32px}.story{padding:4px 2px}}@media(prefers-reduced-motion:reduce){*{animation-duration:.001ms!important;animation-iteration-count:1!important}}
    `}</style>
  </section>;
}
