"use client";

import { useEffect, useRef, useState } from "react";

const scenes = [
  {
    duration: 3000,
    label: "A MARKETPLACE FOR DIGITAL WORK",
    title: ["TURN YOUR SKILLS", "INTO SOMETHING REAL."],
    body: "Templates · bots · AI tools · code · services",
    key: "opening",
    image: "/ad-assets/vennet-ribbon-world.jpg",
  },
  {
    duration: 4000,
    label: "FOR CREATORS",
    title: ["SELL WHAT", "YOU BUILD."],
    body: "Put your work in front of buyers looking for it.",
    key: "selling",
    image: "/ad-assets/vennet-sell-portal.jpg",
  },
  {
    duration: 4000,
    label: "FOR BUYERS",
    title: ["FIND YOUR", "NEXT EDGE."],
    body: "Discover digital work made by independent creators.",
    key: "buying",
    image: "/ad-assets/vennet-discover-tunnel.jpg",
  },
  {
    duration: 4000,
    label: "VENNET",
    title: ["BUY. SELL.", "BUILD."],
    body: "vennetofficial.vercel.app",
    key: "end",
    image: "/ad-assets/vennet-ribbon-world.jpg",
  },
] as const;

type Scene = (typeof scenes)[number];

function SceneArtwork({ scene }: { scene: Scene }) {
  return (
    <div className={"artwork art-" + scene.key} aria-hidden="true">
      <div
        className="artwork-image"
        style={{ backgroundImage: "url(" + scene.image + ")" }}
      />
      <div className="artwork-vignette" />
      <div className="artwork-scan" />
      <div className="artwork-glint glint-one" />
      <div className="artwork-glint glint-two" />
      <div className="artwork-grain" />
      {scene.key === "end" ? (
        <div className="end-emblem"><span /><span /></div>
      ) : null}
    </div>
  );
}

export function AdStudioPlayer() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [run, setRun] = useState(0);
  const timers = useRef<number[]>([]);
  const audio = useRef<AudioContext | null>(null);
  const phone = useRef<HTMLDivElement>(null);
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
    master.gain.value = 0.04;
    master.connect(context.destination);

    const tone = (at: number, frequency: number, length: number, type: OscillatorType) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, at);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(48, frequency * 0.62), at + length);
      gain.gain.setValueAtTime(0.001, at);
      gain.gain.exponentialRampToValueAtTime(0.8, at + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, at + length);
      oscillator.connect(gain).connect(master);
      oscillator.start(at);
      oscillator.stop(at + length + 0.04);
    };

    const start = context.currentTime + 0.06;
    Array.from({ length: 16 }, (_, index) => index * 0.92).forEach((beat, index) => {
      tone(start + beat, index % 4 === 0 ? 112 : 176, index % 4 === 0 ? 0.42 : 0.15, index % 4 === 0 ? "sine" : "triangle");
    });
    [3, 7, 11].forEach((beat) => tone(start + beat, 580, 0.52, "sawtooth"));
  };

  const play = () => {
    stop();
    setSceneIndex(0);
    setRun((value) => value + 1);
    setPlaying(true);

    if (soundOn) {
      playSound();
      const voice = new SpeechSynthesisUtterance(
        "Built something worth sharing? Sell templates, tools, bots, code, and services on Vennet. Or discover digital work that gives you an edge. Vennet. Buy, sell, build."
      );
      voice.rate = 1.04;
      voice.pitch = 0.91;
      voice.volume = 0.82;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(voice);
    }

    timers.current = [
      window.setTimeout(() => setSceneIndex(1), 3000),
      window.setTimeout(() => setSceneIndex(2), 7000),
      window.setTimeout(() => setSceneIndex(3), 11000),
      window.setTimeout(() => {
        stopAudio();
        setPlaying(false);
      }, 15000),
    ];
  };

  const preview = (index: number) => {
    stop();
    setSceneIndex(index);
    setRun((value) => value + 1);
  };

  const focusFilm = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
      return;
    }
    phone.current?.requestFullscreen?.().catch(() => undefined);
  };

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    stopAudio();
  }, []);

  return (
    <section className="ad-studio">
      <div className="studio-bar">
        <div>
          <p>PRIVATE RECORDING STUDIO</p>
          <h1>Vennet brand film</h1>
          <span>15-second 9:16 graphic ad · made for a clean screen recording</span>
        </div>
        <div className="buttons">
          <button type="button" onClick={focusFilm}>Focus film ⛶</button>
          <button type="button" onClick={() => setSoundOn((value) => !value)}>
            {soundOn ? "Sound on" : "Sound off"}
          </button>
          <button type="button" className="play" onClick={playing ? stop : play}>
            {playing ? "Stop film ■" : "Play full film ▶"}
          </button>
        </div>
      </div>

      <div className="studio-main">
        <div className="film-stage">
          <div className="phone" ref={phone}>
            <div className="camera-island" />
            <div className={"film film-" + scene.key} key={scene.key + "-" + run}>
              <SceneArtwork scene={scene} />
              <header className="film-header">
                <span><b>V</b> vennet</span>
                <span>{String(sceneIndex + 1).padStart(2, "0")} / 04</span>
              </header>
              <footer className="film-copy">
                <p>{scene.label}</p>
                <h2>{scene.title.map((line) => <span key={line}>{line}</span>)}</h2>
                <div><i />{scene.body}</div>
              </footer>
            </div>
          </div>
        </div>

        <aside className="story">
          <p className="story-label">THE STORY</p>
          <div className="story-list">
            {scenes.map((item, index) => (
              <button
                type="button"
                key={item.key}
                className={index === sceneIndex ? "now" : ""}
                onClick={() => preview(index)}
              >
                <b>{index === 0 ? "0–3 sec" : index === 1 ? "3–7 sec" : index === 2 ? "7–11 sec" : "11–15 sec"}</b>
                <span>{item.label}</span>
                <small>{item.body}</small>
              </button>
            ))}
          </div>
          <div className="recording-tip">
            <b>Made for recording</b>
            <p>Use Focus film, press Play, and record the 15 seconds. It now uses cinematic graphic scenes—not mock marketplace screens.</p>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .ad-studio{overflow:hidden;border:1px solid #dbe8e1;border-radius:30px;background:#fff;box-shadow:0 30px 85px rgba(6,78,59,.13);color:#0f172a}
        .studio-bar{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:27px 31px;border-bottom:1px solid #e5eee9;background:linear-gradient(100deg,#fff 20%,#f0fdf4)}
        .studio-bar p,.story-label{margin:0;color:#047857;font-size:11px;font-weight:950;letter-spacing:.2em}
        .studio-bar h1{margin:5px 0 3px;font-size:27px;letter-spacing:-.055em}
        .studio-bar span{color:#64748b;font-size:13px}
        .buttons{display:flex;flex-wrap:wrap;gap:9px;justify-content:flex-end}
        .buttons button{border:1px solid #cbd5e1;border-radius:12px;background:#fff;padding:11px 14px;color:#334155;font:inherit;font-size:13px;font-weight:850;cursor:pointer;transition:transform .2s,box-shadow .2s}
        .buttons button:hover{transform:translateY(-1px);box-shadow:0 9px 17px rgba(15,23,42,.1)}
        .buttons .play{border-color:#10b981;background:#10b981;color:#022c22;box-shadow:0 10px 22px rgba(16,185,129,.24)}
        .studio-main{display:grid;grid-template-columns:minmax(0,1fr) 315px;gap:35px;padding:34px}
        .film-stage{display:grid;min-height:690px;place-items:center;border-radius:25px;background:radial-gradient(circle at 50% 5%,#bbf7d0 0,transparent 29%),linear-gradient(135deg,#effcf6 0%,#f8fafc 62%,#e2e8f0 100%)}
        .phone{position:relative;width:min(100%,390px);padding:7px;border-radius:42px;background:#020617;box-shadow:0 35px 58px rgba(15,23,42,.32)}
        .camera-island{position:absolute;z-index:30;top:10px;left:50%;width:112px;height:21px;border-radius:999px;background:#020617;transform:translateX(-50%)}
        .film{position:relative;aspect-ratio:9/16;overflow:hidden;border-radius:35px;background:#020617;color:#fff;isolation:isolate}
        .artwork{position:absolute;inset:0;z-index:1;overflow:hidden;background:#020617}
        .artwork-image{position:absolute;inset:-5%;background-position:center;background-size:cover;filter:saturate(1.08) contrast(1.04);animation:camera-ride 4s cubic-bezier(.16,1,.3,1) both}
        .art-opening .artwork-image{background-position:52% center;animation-name:opening-ride}
        .art-selling .artwork-image{background-position:center 58%;animation-name:selling-ride}
        .art-buying .artwork-image{background-position:center 54%;animation-name:buying-ride}
        .art-end .artwork-image{background-position:50% 54%;filter:saturate(.95) contrast(1.12) brightness(.74);animation-name:end-ride}
        .artwork-vignette{position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,6,23,.82) 0%,rgba(2,6,23,.14) 35%,rgba(2,6,23,.15) 55%,rgba(2,6,23,.96) 100%),linear-gradient(90deg,rgba(2,6,23,.35),transparent 50%,rgba(2,6,23,.25))}
        .artwork-scan{position:absolute;inset:-20% -40%;background:linear-gradient(104deg,transparent 42%,rgba(167,243,208,.15) 49%,rgba(255,255,255,.55) 50%,rgba(16,185,129,.13) 52%,transparent 59%);mix-blend-mode:screen;opacity:.8;transform:translateX(-80%);animation:scan 4s ease-in-out both .24s}
        .artwork-glint{position:absolute;width:7px;height:7px;border-radius:50%;background:#d1fae5;box-shadow:0 0 11px 4px rgba(110,231,183,.5);animation:glint 2s ease-in-out infinite}
        .glint-one{top:35%;left:20%;animation-delay:.1s}.glint-two{top:61%;right:17%;animation-delay:1s}
        .artwork-grain{position:absolute;inset:0;opacity:.1;background-image:radial-gradient(rgba(255,255,255,.7) .6px,transparent .7px);background-size:4px 4px;mix-blend-mode:soft-light}
        .film-header{position:relative;z-index:10;display:flex;justify-content:space-between;padding:34px 27px 0;color:#d1fae5;font-size:10px;font-weight:800;letter-spacing:.11em}
        .film-header span:first-child{display:flex;align-items:center;gap:7px;letter-spacing:0}
        .film-header b{display:grid;place-items:center;width:20px;height:20px;border-radius:7px;background:#a7f3d0;color:#022c22;font-size:12px}
        .film-copy{position:absolute;right:25px;bottom:28px;left:25px;z-index:12;animation:copy-in .62s cubic-bezier(.16,1,.3,1) both .14s}
        .film-copy p{margin:0;color:#6ee7b7;font-size:9px;font-weight:950;letter-spacing:.19em;text-shadow:0 1px 12px #020617}
        .film-copy h2{margin:11px 0 14px;font-size:34px;font-weight:950;line-height:.84;letter-spacing:-.075em;text-shadow:0 5px 24px rgba(2,6,23,.8)}
        .film-copy h2 span{display:block}
        .film-copy div{display:flex;align-items:center;gap:8px;color:#ecfdf5;font-size:10px;font-weight:750;line-height:1.35;text-shadow:0 2px 11px #020617}
        .film-copy div i{display:block;flex:0 0 auto;width:7px;height:7px;border-radius:50%;background:#6ee7b7;box-shadow:0 0 10px #6ee7b7}
        .end-emblem{position:absolute;z-index:5;top:20%;left:50%;width:108px;height:145px;filter:drop-shadow(0 0 23px rgba(110,231,183,.82));transform:translateX(-50%);animation:emblem-in 3.8s cubic-bezier(.16,1,.3,1) both}
        .end-emblem span{position:absolute;top:2px;width:26px;height:132px;border:1px solid rgba(236,253,245,.82);border-radius:12px;background:linear-gradient(90deg,#047857,#d1fae5 52%,#065f46);box-shadow:inset 7px 0 13px rgba(255,255,255,.33),inset -6px 0 12px rgba(0,0,0,.35)}
        .end-emblem span:first-child{left:24px;transform:rotate(-25deg)}.end-emblem span:last-child{right:24px;transform:rotate(25deg)}
        .story{display:flex;flex-direction:column;justify-content:center}
        .story-list{display:grid;gap:8px;margin-top:15px}
        .story-list button{width:100%;border:1px solid #e2e8f0;border-radius:15px;background:#fff;padding:13px;color:#64748b;text-align:left;cursor:pointer;transition:.2s}
        .story-list button:hover{transform:translateX(2px);border-color:#a7f3d0}
        .story-list button.now{border-color:#6ee7b7;background:#ecfdf5;color:#064e3b;box-shadow:0 9px 20px rgba(16,185,129,.11)}
        .story-list b,.story-list span,.story-list small{display:block}.story-list b{font-size:10px}.story-list span{margin-top:4px;font-size:12px;font-weight:950;letter-spacing:.04em}.story-list small{margin-top:4px;font-size:11px;line-height:1.35}
        .recording-tip{margin-top:18px;padding:17px;border-radius:17px;background:#061b15;color:#d1fae5;font-size:12px;line-height:1.5}.recording-tip b{display:block;color:#fff;font-size:14px}.recording-tip p{margin:6px 0 0}
        .phone:fullscreen{display:grid;place-items:center;width:auto;height:100%;padding:0;border-radius:0;background:#000}.phone:fullscreen .camera-island{display:none}.phone:fullscreen .film{width:min(100vw,56.25vh);height:auto;border-radius:0}.phone:fullscreen .film-copy h2{font-size:clamp(34px,5vh,62px)}.phone:fullscreen .film-copy{right:7%;bottom:7%;left:7%}.phone:fullscreen .film-header{padding:7% 7% 0}
        @keyframes camera-ride{0%{transform:scale(1.12) translate3d(-1.5%,2%,0)}100%{transform:scale(1.03) translate3d(1%,0,0)}}@keyframes opening-ride{0%{transform:scale(1.14) translateY(2%)}100%{transform:scale(1.04) translateY(-1%)}}@keyframes selling-ride{0%{transform:scale(1.14) translateX(-2%)}100%{transform:scale(1.04) translateX(1%)}}@keyframes buying-ride{0%{transform:scale(1.16) translateY(3%)}100%{transform:scale(1.04) translateY(-2%)}}@keyframes end-ride{0%{transform:scale(1.18)}100%{transform:scale(1.04)}}@keyframes scan{0%,15%{transform:translateX(-80%)}70%,100%{transform:translateX(82%)}}@keyframes glint{50%{transform:scale(2.4);opacity:.3}}@keyframes copy-in{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}@keyframes emblem-in{0%{opacity:0;transform:translate(-50%,60px) scale(.63)}36%,84%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:.92;transform:translate(-50%,-4px) scale(.97)}}
        @media(max-width:800px){.studio-bar{align-items:flex-start;flex-direction:column;padding:22px}.studio-main{grid-template-columns:1fr;padding:18px}.film-stage{min-height:auto;padding:25px 12px}.phone{max-width:340px}.film-copy h2{font-size:31px}.story{padding:4px 2px}}@media(prefers-reduced-motion:reduce){*{animation-duration:.001ms!important;animation-iteration-count:1!important}}
      `}</style>
    </section>
  );
}
