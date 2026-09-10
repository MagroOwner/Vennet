"use client";

import { useEffect, useRef, useState } from "react";

const scenes = [
  { duration: 3000, kicker: "VENNET PRESENTS", title: ["MADE SOMETHING", "WORTH SELLING?"], detail: "Templates · code · bots · AI tools", mode: "assemble" },
  { duration: 4000, kicker: "SELL ON VENNET", title: ["SELL DIGITAL", "WORK ON VENNET"], detail: "Build it. Publish it. Let buyers find it.", mode: "publish" },
  { duration: 4000, kicker: "BUY FROM CREATORS", title: ["DISCOVER WHAT", "HELPS YOU BUILD"], detail: "Tools, templates, services, and more.", mode: "discover" },
  { duration: 4000, kicker: "THE VENNET MARKETPLACE", title: ["BUY. SELL.", "BUILD."], detail: "vennetofficial.vercel.app", mode: "reveal" },
] as const;

type Mode = (typeof scenes)[number]["mode"];

function Visual({ mode }: { mode: Mode }) {
  if (mode === "assemble") return <div className="stage assemble">
    <i className="beam b1" /><i className="beam b2" />
    <div className="float template">◇<small>TEMPLATE</small></div><div className="float code">{"{ }"}<small>CODE</small></div>
    <div className="float bot">◉<small>BOT</small></div><div className="float ai">✦<small>AI</small></div><div className="float file">▣<small>DOWNLOAD</small></div>
    <div className="floor" />
  </div>;
  if (mode === "publish") return <div className="stage publish">
    <i className="publish-glow" /><div className="listing one"><span>{"{ }"}</span><b>Code kit</b><small>digital tool</small></div>
    <div className="listing two"><span>✦</span><b>AI workflow</b><small>automation</small></div><div className="listing three"><span>◉</span><b>Bot pack</b><small>ready to use</small></div>
    <div className="publish-action">PUBLISH ↗</div>
  </div>;
  if (mode === "discover") return <div className="stage discover">
    <div className="travel-card left"><span>AI</span><b>Workflows</b></div><div className="travel-card center"><span>{"{ }"}</span><b>Components</b></div>
    <div className="travel-card right"><span>◉</span><b>Discord bots</b></div><div className="travel-card back"><span>◇</span><b>Templates</b></div>
    <i className="cursor">↗</i><i className="select-ring" />
  </div>;
  return <div className="stage reveal"><i className="light l1" /><i className="light l2" /><div className="v-mark"><i /><i /></div><div className="v-glow" /><div className="stars">✦ · ✦ · ✦</div></div>;
}

export function AdStudioPlayer() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(true);
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
    setPlaying(false);
    stopAudio();
  };

  const startSound = () => {
    const context = new AudioContext();
    audio.current = context;
    const output = context.createGain();
    output.gain.value = 0.035;
    output.connect(context.destination);
    const tone = (time: number, frequency: number, seconds: number, kind: OscillatorType) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = kind;
      oscillator.frequency.setValueAtTime(frequency, time);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(45, frequency / 1.7), time + seconds);
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.exponentialRampToValueAtTime(1, time + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, time + seconds);
      oscillator.connect(gain).connect(output);
      oscillator.start(time);
      oscillator.stop(time + seconds + 0.05);
    };
    const start = context.currentTime + 0.05;
    Array.from({ length: 20 }, (_, index) => index * 0.75).forEach((beat, index) => tone(start + beat, index % 4 === 0 ? 130 : 196, index % 4 === 0 ? 0.45 : 0.18, index % 4 === 0 ? "sine" : "triangle"));
    [3, 7, 11].forEach((beat) => tone(start + beat, 650, 0.65, "sawtooth"));
  };

  const play = () => {
    stop();
    setSceneIndex(0);
    setPlaying(true);
    if (sound) {
      startSound();
      const voice = new SpeechSynthesisUtterance("Turn your digital work into something people can discover. Sell templates, tools, bots, code, and services, or find what helps you build next. Vennet.");
      voice.rate = 1.06;
      voice.pitch = 0.92;
      voice.volume = 0.86;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(voice);
    }
    timers.current = [
      window.setTimeout(() => setSceneIndex(1), 3000),
      window.setTimeout(() => setSceneIndex(2), 7000),
      window.setTimeout(() => setSceneIndex(3), 11000),
      window.setTimeout(() => { setPlaying(false); stopAudio(); }, 15000),
    ];
  };

  useEffect(() => () => { timers.current.forEach((timer) => window.clearTimeout(timer)); stopAudio(); }, []);

  return <section className="studio">
    <div className="head"><div><p>PRIVATE RECORDING STUDIO</p><h1>Vennet 15-second ad</h1><span>A continuous vertical browser animation made for screen recording.</span></div>
      <div className="controls"><button type="button" onClick={() => setSound((value) => !value)}>{sound ? "Sound on" : "Sound off"}</button><button type="button" className="play" onClick={playing ? stop : play}>{playing ? "Stop ad ■" : "Play full ad ▶"}</button></div></div>
    <div className="layout"><div className="phone-area"><div className="phone"><div className="speaker" /><div className={"film scene-" + scene.mode} key={scene.mode}>
      <div className="ambient a1" /><div className="ambient a2" /><div className="grain" />
      <header><span><b>V</b> vennet</span><span>{String(sceneIndex + 1).padStart(2, "0")} / 04</span></header>
      <Visual mode={scene.mode} />
      <footer><p>{scene.kicker}</p><h2>{scene.title.map((line) => <span key={line}>{line}</span>)}</h2><div><i />{scene.detail}</div></footer>
    </div></div></div>
    <aside><p className="label">RECORDING FLOW</p><ol>{scenes.map((item, index) => <li key={item.mode} className={sceneIndex === index ? "active" : ""}><b>{index === 0 ? "0–3s" : index === 1 ? "3–7s" : index === 2 ? "7–11s" : "11–15s"}</b><span>{item.title.join(" ")}</span></li>)}</ol>
      <div className="tip"><b>How to record it</b><p>Press <strong>Play full ad</strong>, choose only the phone frame in your screen recorder, and record for 15 seconds. Sound begins after Play.</p></div>
      <small>This is a browser-made 3D-style motion ad. It is not a Blender-rendered MP4.</small>
    </aside></div>
    <style jsx>{`
      .studio{overflow:hidden;border:1px solid #d9e5df;border-radius:28px;background:#fff;box-shadow:0 28px 80px rgba(6,78,59,.12);color:#0f172a}.head{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:28px 32px;border-bottom:1px solid #e5eee9;background:linear-gradient(110deg,#fff,#f0fdf4)}.head p,.label{margin:0;color:#047857;font-size:11px;font-weight:900;letter-spacing:.2em}.head h1{margin:6px 0 3px;font-size:26px;letter-spacing:-.04em}.head span{color:#64748b;font-size:14px}.controls{display:flex;gap:10px}.controls button{border:1px solid #cbd5e1;border-radius:12px;background:#fff;padding:11px 14px;font:inherit;font-weight:800;color:#334155;cursor:pointer}.controls .play{border-color:#10b981;background:#10b981;color:#022c22;box-shadow:0 8px 20px rgba(16,185,129,.25)}.layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:34px;padding:34px}.phone-area{display:flex;justify-content:center;align-items:center;min-height:660px;border-radius:24px;background:radial-gradient(circle at 50% 10%,#bbf7d0 0,transparent 32%),linear-gradient(135deg,#ecfdf5,#f8fafc 55%,#e2e8f0)}.phone{position:relative;width:min(100%,390px);padding:7px;border-radius:40px;background:#030814;box-shadow:0 35px 55px rgba(15,23,42,.28)}.speaker{position:absolute;z-index:20;top:10px;left:50%;width:110px;height:21px;border-radius:999px;background:#030814;transform:translateX(-50%)}.film{position:relative;aspect-ratio:9/16;overflow:hidden;border-radius:34px;background:#020617;color:#fff;isolation:isolate}.ambient{position:absolute;border-radius:999px;filter:blur(30px);opacity:.48;animation:drift 7s ease-in-out infinite}.a1{top:-90px;right:-80px;width:250px;height:250px;background:#10b981}.a2{bottom:110px;left:-120px;width:230px;height:230px;background:#0f766e;animation-delay:-3s}.grain{position:absolute;inset:0;z-index:10;opacity:.07;background-image:radial-gradient(rgba(255,255,255,.45) .7px,transparent .7px);background-size:4px 4px;pointer-events:none}.film header{position:relative;z-index:15;display:flex;justify-content:space-between;padding:34px 27px 0;color:#d1fae5;font-size:10px;font-weight:800;letter-spacing:.11em}.film header span:first-child{display:flex;align-items:center;gap:7px;letter-spacing:0}.film header b{display:grid;place-items:center;width:20px;height:20px;border-radius:7px;background:#a7f3d0;color:#022c22;font-size:12px}.stage{position:absolute;inset:80px 0 168px;z-index:4;perspective:700px}.beam{position:absolute;width:1px;height:270px;background:linear-gradient(transparent,#6ee7b7,transparent);box-shadow:0 0 22px #6ee7b7;animation:beam 3s ease-in-out infinite}.b1{left:27%;top:20px;transform:rotate(29deg)}.b2{right:22%;top:-8px;transform:rotate(-32deg);animation-delay:-1.2s}.floor{position:absolute;right:-60px;bottom:8px;left:-60px;height:115px;border-top:1px solid rgba(167,243,208,.25);background:repeating-linear-gradient(90deg,transparent 0 24px,rgba(167,243,208,.12) 25px 26px);transform:rotateX(62deg)}.float{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;width:78px;height:90px;border:1px solid rgba(209,250,229,.48);border-radius:19px;background:linear-gradient(145deg,rgba(255,255,255,.3),rgba(16,185,129,.1));box-shadow:inset 0 1px 1px rgba(255,255,255,.4),0 18px 35px rgba(0,0,0,.35);backdrop-filter:blur(9px);color:#a7f3d0;font-size:29px;font-weight:900;animation:float-in 3s cubic-bezier(.22,1,.36,1) both}.float small{margin-top:5px;color:#f0fdf4;font-size:8px;letter-spacing:.1em}.template{left:24px;top:58px}.code{left:143px;top:23px;animation-delay:.3s}.bot{right:27px;top:63px;animation-delay:.6s}.ai{left:66px;bottom:32px;animation-delay:.8s}.file{right:105px;bottom:20px;animation-delay:1s}.publish-glow{position:absolute;top:22px;left:50%;width:190px;height:190px;border-radius:50%;background:#10b981;filter:blur(34px);opacity:.35;transform:translateX(-50%);animation:breathe 3s ease-in-out infinite}.listing{position:absolute;display:flex;flex-direction:column;width:133px;height:118px;padding:15px;border:1px solid rgba(209,250,229,.42);border-radius:16px;background:linear-gradient(145deg,rgba(255,255,255,.3),rgba(15,23,42,.28));box-shadow:0 18px 42px rgba(0,0,0,.25);backdrop-filter:blur(10px);animation:list-in 4s cubic-bezier(.22,1,.36,1) both}.listing span{color:#6ee7b7;font-size:19px;font-weight:900}.listing b{margin-top:12px;font-size:14px;letter-spacing:-.05em}.listing small{margin-top:3px;color:#bbf7d0;font-size:9px}.one{top:30px;left:17px;transform:rotate(-9deg)}.two{top:69px;right:17px;transform:rotate(8deg);animation-delay:.35s}.three{bottom:17px;left:108px;transform:rotate(-2deg);animation-delay:.7s}.publish-action{position:absolute;z-index:4;top:157px;left:50%;padding:14px 18px;border-radius:12px;background:#6ee7b7;color:#022c22;font-size:11px;font-weight:950;letter-spacing:.1em;box-shadow:0 0 28px rgba(110,231,183,.55);transform:translateX(-50%);animation:publish-in 4s ease both .9s}.travel-card{position:absolute;display:flex;flex-direction:column;justify-content:flex-end;width:145px;height:185px;padding:16px;border:1px solid rgba(255,255,255,.38);border-radius:22px;background:linear-gradient(145deg,rgba(255,255,255,.36),rgba(16,185,129,.13));box-shadow:0 21px 52px rgba(0,0,0,.38);backdrop-filter:blur(12px);animation:fly 4s cubic-bezier(.22,1,.36,1) both}.travel-card span{position:absolute;top:20px;color:#a7f3d0;font-size:30px;font-weight:950}.travel-card b{font-size:19px;letter-spacing:-.06em}.left{top:45px;left:-26px}.center{top:8px;left:122px;animation-delay:.3s}.right{right:-35px;bottom:35px;animation-delay:.6s}.back{bottom:-35px;left:58px;animation-delay:.9s}.cursor{position:absolute;z-index:8;right:86px;top:121px;color:#fff;font-size:46px;filter:drop-shadow(0 0 14px #6ee7b7);animation:cursor-in 4s ease both 1.1s}.select-ring{position:absolute;z-index:7;right:102px;top:108px;width:75px;height:75px;border:2px solid #6ee7b7;border-radius:50%;box-shadow:0 0 28px #6ee7b7;animation:ring 1s ease-in-out infinite}.light{position:absolute;top:-40px;width:115px;height:460px;background:linear-gradient(180deg,rgba(110,231,183,.45),transparent 76%);filter:blur(19px);transform:rotate(21deg);animation:sweep 3.5s ease-in-out infinite}.l1{left:15px}.l2{right:15px;animation-delay:-1.5s}.v-mark{position:absolute;z-index:6;top:79px;left:50%;width:170px;height:210px;filter:drop-shadow(0 0 35px rgba(110,231,183,.65));transform:translateX(-50%);animation:v-in 4s cubic-bezier(.16,1,.3,1) both}.v-mark i{position:absolute;top:12px;width:43px;height:193px;border:2px solid rgba(236,253,245,.75);border-radius:15px;background:linear-gradient(90deg,#047857,#d1fae5 47%,#064e3b);box-shadow:inset 8px 0 16px rgba(255,255,255,.3),inset -8px 0 18px rgba(0,0,0,.28)}.v-mark i:first-child{left:33px;transform:rotate(-25deg)}.v-mark i:last-child{right:33px;transform:rotate(25deg)}.v-glow{position:absolute;top:170px;left:50%;width:230px;height:130px;border-radius:50%;background:#10b981;filter:blur(55px);opacity:.45;transform:translateX(-50%);animation:breathe 3s ease-in-out infinite}.stars{position:absolute;top:32px;left:50%;color:#d1fae5;letter-spacing:60px;white-space:nowrap;filter:drop-shadow(0 0 10px #6ee7b7);animation:stars 2s ease-in-out infinite}.film footer{position:absolute;right:25px;bottom:28px;left:25px;z-index:14;animation:copy-in .65s cubic-bezier(.16,1,.3,1) both}.film footer p{margin:0;color:#6ee7b7;font-size:9px;font-weight:950;letter-spacing:.2em}.film footer h2{margin:11px 0 13px;font-size:37px;line-height:.86;letter-spacing:-.075em}.film footer h2 span{display:block}.film footer div{display:flex;align-items:center;gap:8px;color:#d1fae5;font-size:11px;font-weight:700}.film footer div i{width:7px;height:7px;border-radius:50%;background:#6ee7b7;box-shadow:0 0 10px #6ee7b7}.layout aside{display:flex;flex-direction:column;justify-content:center}.layout ol{margin:16px 0;padding:0;list-style:none}.layout li{display:flex;flex-direction:column;gap:4px;margin-bottom:7px;padding:13px;border:1px solid #e2e8f0;border-radius:14px;color:#64748b;transition:.25s}.layout li.active{border-color:#6ee7b7;background:#ecfdf5;color:#064e3b;box-shadow:0 8px 18px rgba(16,185,129,.12)}.layout li b{font-size:11px}.layout li span{font-size:13px;font-weight:800}.tip{margin-top:8px;padding:17px;border-radius:16px;background:#061b15;color:#d1fae5;font-size:13px;line-height:1.5}.tip b{display:block;color:#fff;font-size:14px}.tip p{margin:7px 0 0}.tip strong{color:#6ee7b7}.layout aside>small{margin:20px 4px 0;color:#64748b;font-size:12px;line-height:1.55}@keyframes drift{50%{transform:translate(-16px,23px) scale(1.12)}}@keyframes float-in{0%{opacity:0;transform:translateY(75px) rotateX(-28deg) scale(.55)}38%,80%{opacity:1;transform:translateY(0) rotateX(0) scale(1)}100%{opacity:0;transform:translateY(-24px) scale(.94)}}@keyframes beam{50%{opacity:.25;transform:scaleY(.72) rotate(29deg)}}@keyframes breathe{50%{opacity:.7;transform:translateX(-50%) scale(1.14)}}@keyframes list-in{0%{opacity:0;transform:translateY(70px) scale(.55)}35%,81%{opacity:1}100%{opacity:0;transform:translateY(-24px) scale(.95)}}@keyframes publish-in{0%,25%{opacity:0;transform:translate(-50%,24px) scale(.7)}43%,78%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-12px)}}@keyframes fly{0%{opacity:0;transform:translate3d(0,110px,-150px) scale(.4) rotate(-15deg)}35%,82%{opacity:1}100%{opacity:0;transform:translate3d(0,-80px,80px) scale(1.22) rotate(6deg)}}@keyframes cursor-in{0%,30%{opacity:0;transform:translate(-70px,60px) scale(.55)}52%,80%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0}}@keyframes ring{50%{transform:scale(1.24);opacity:.3}}@keyframes sweep{50%{transform:translateX(55px) rotate(21deg);opacity:.25}}@keyframes v-in{0%{opacity:0;transform:translate(-50%,90px) scale(.55)}38%,81%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-15px) scale(.95)}}@keyframes stars{50%{transform:translateY(12px);opacity:.25}}@keyframes copy-in{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}@media(max-width:800px){.head{align-items:flex-start;flex-direction:column;padding:22px}.layout{grid-template-columns:1fr;padding:18px}.phone-area{min-height:auto;padding:25px 12px}.phone{max-width:340px}.film footer h2{font-size:33px}}@media(prefers-reduced-motion:reduce){*{animation-duration:.001ms!important;animation-iteration-count:1!important}}
    `}</style>
  </section>;
}
