"use client";

import { useState } from "react";
import { saveWelcomeResponse } from "@/lib/actions/welcome";

const questions = [
  {
    key: "reason",
    eyebrow: "A quick hello",
    title: "What brought you to Vennet?",
    detail: "This helps us make your first visit more useful.",
    choices: [
      ["buy", "Find digital tools", "I want templates, tools, bots, or useful downloads."],
      ["sell", "Sell my work", "I have digital work, services, or tools to share."],
      ["both", "A little of both", "I want to discover work and sell my own."],
      ["explore", "Just exploring", "I am seeing what Vennet is about."],
    ],
  },
  {
    key: "discoverySource",
    eyebrow: "Help us grow",
    title: "Where did you find Vennet?",
    detail: "One quick answer helps us know what is reaching people.",
    choices: [
      ["tiktok", "TikTok", "A video or creator post."],
      ["instagram", "Instagram", "A reel, story, or post."],
      ["discord", "Discord", "A server, community, or bot."],
      ["friend", "A friend", "Someone sent Vennet to me."],
      ["search", "Search", "Google, an AI answer, or another search tool."],
      ["other", "Somewhere else", "Another place online or offline."],
    ],
  },
  {
    key: "goal",
    eyebrow: "Your next move",
    title: "What are you looking to achieve?",
    detail: "Pick the path that sounds most like you right now.",
    choices: [
      ["launch", "Launch something", "Create a listing and start selling."],
      ["discover", "Find an advantage", "Discover tools that help me make more."],
      ["grow", "Grow my business", "Build a storefront and reach customers."],
      ["learn", "Learn and explore", "See what creators are building."],
    ],
  },
] as const;

type Answers = { reason: string; discoverySource: string; goal: string };

export function WelcomeQuestionnaire() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ reason: "", discoverySource: "", goal: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(true);
  const question = questions[step];

  if (!open) return null;

  const choose = (value: string) => {
    setAnswers((current) => ({ ...current, [question.key]: value }));
    setError("");
  };

  const next = async () => {
    if (!answers[question.key as keyof Answers]) {
      setError("Choose the option that fits you best.");
      return;
    }

    if (step < questions.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    setSaving(true);
    const result = await saveWelcomeResponse({
      reason: answers.reason as "buy" | "sell" | "both" | "explore",
      discoverySource: answers.discoverySource as "tiktok" | "instagram" | "discord" | "friend" | "search" | "other",
      goal: answers.goal as "launch" | "discover" | "grow" | "learn",
    });
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setOpen(false);
  };

  return <div className="welcome-overlay" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
    <div className="welcome-card">
      <div className="welcome-art"><div className="welcome-orb one" /><div className="welcome-orb two" /><div className="welcome-mark">V</div></div>
      <div className="welcome-content">
        <div className="welcome-progress" aria-label={"Question " + (step + 1) + " of 3"}>
          {questions.map((_, index) => <i key={index} className={index <= step ? "done" : ""} />)}
        </div>
        <p className="welcome-eyebrow">{question.eyebrow}</p>
        <h1 id="welcome-title">{question.title}</h1>
        <p className="welcome-detail">{question.detail}</p>

        <div className="welcome-choices">
          {question.choices.map(([value, label, description]) => <button key={value} type="button" className={answers[question.key as keyof Answers] === value ? "selected" : ""} onClick={() => choose(value)}>
            <span className="choice-dot" /><span><b>{label}</b><small>{description}</small></span>
          </button>)}
        </div>

        {error && <p className="welcome-error">{error}</p>}
        <div className="welcome-footer">
          <span>{step + 1} of {questions.length}</span>
          <button type="button" onClick={next} disabled={saving}>{saving ? "Saving…" : step === questions.length - 1 ? "Finish →" : "Continue →"}</button>
        </div>
      </div>
    </div>

    <style jsx>{`
      .welcome-overlay{position:fixed;z-index:100;inset:0;display:grid;place-items:center;padding:20px;background:rgba(2,12,9,.64);backdrop-filter:blur(12px);animation:fade .25s ease-out}.welcome-card{display:grid;grid-template-columns:190px minmax(0,1fr);width:min(100%,720px);overflow:hidden;border:1px solid rgba(167,243,208,.45);border-radius:28px;background:#fff;box-shadow:0 34px 100px rgba(0,0,0,.38);animation:rise .35s cubic-bezier(.16,1,.3,1)}.welcome-art{position:relative;min-height:520px;overflow:hidden;background:radial-gradient(circle at 50% 34%,#34d399,transparent 25%),linear-gradient(155deg,#04352a,#021b16 58%,#06101a)}.welcome-orb{position:absolute;border-radius:999px;filter:blur(10px);opacity:.72;animation:float 6s ease-in-out infinite}.welcome-orb.one{top:42px;left:-70px;width:210px;height:210px;background:#34d399}.welcome-orb.two{right:-78px;bottom:55px;width:190px;height:190px;background:#2dd4bf;animation-delay:-2s}.welcome-mark{position:absolute;top:50%;left:50%;display:grid;place-items:center;width:108px;height:108px;border:1px solid rgba(236,253,245,.62);border-radius:32px;background:linear-gradient(145deg,rgba(255,255,255,.4),rgba(110,231,183,.18));box-shadow:inset 0 1px 1px rgba(255,255,255,.7),0 0 56px rgba(52,211,153,.55);color:#ecfdf5;font-size:62px;font-weight:950;letter-spacing:-.13em;transform:translate(-50%,-50%) rotate(-8deg)}.welcome-content{padding:38px 38px 30px}.welcome-progress{display:flex;gap:7px}.welcome-progress i{width:28px;height:5px;border-radius:999px;background:#dbe7e1}.welcome-progress i.done{background:#10b981}.welcome-eyebrow{margin:28px 0 0;color:#047857;font-size:11px;font-weight:950;letter-spacing:.2em;text-transform:uppercase}.welcome-content h1{margin:8px 0 0;color:#0f172a;font-size:31px;line-height:1.03;letter-spacing:-.055em}.welcome-detail{margin:12px 0 0;color:#64748b;font-size:14px;line-height:1.55}.welcome-choices{display:grid;gap:9px;margin-top:27px}.welcome-choices button{display:flex;gap:12px;width:100%;padding:13px 14px;border:1px solid #dbe5e0;border-radius:14px;background:#fff;text-align:left;transition:.18s;cursor:pointer}.welcome-choices button:hover{border-color:#6ee7b7;background:#f0fdf4}.welcome-choices button.selected{border-color:#10b981;background:#ecfdf5;box-shadow:0 0 0 3px rgba(16,185,129,.1)}.choice-dot{display:block;flex:0 0 auto;width:18px;height:18px;margin-top:2px;border:2px solid #b9c8c0;border-radius:999px}.selected .choice-dot{border:5px solid #059669}.welcome-choices b{display:block;color:#12221b;font-size:14px}.welcome-choices small{display:block;margin-top:3px;color:#718096;font-size:12px;line-height:1.35}.welcome-error{margin:12px 0 0;color:#b42318;font-size:13px;font-weight:700}.welcome-footer{display:flex;align-items:center;justify-content:space-between;margin-top:25px;color:#64748b;font-size:13px;font-weight:800}.welcome-footer button{border:0;border-radius:12px;background:#10b981;padding:12px 17px;color:#022c22;font:inherit;font-weight:950;box-shadow:0 10px 22px rgba(16,185,129,.22);cursor:pointer}.welcome-footer button:disabled{opacity:.6;cursor:wait}@keyframes fade{from{opacity:0}to{opacity:1}}@keyframes rise{from{opacity:0;transform:translateY(20px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes float{50%{transform:translate(15px,22px) scale(1.1)}}@media(max-width:620px){.welcome-card{grid-template-columns:1fr;max-height:calc(100dvh - 40px);overflow:auto}.welcome-art{min-height:124px}.welcome-mark{width:82px;height:82px;border-radius:25px;font-size:48px}.welcome-content{padding:28px 23px 23px}.welcome-eyebrow{margin-top:22px}.welcome-content h1{font-size:27px}.welcome-choices{margin-top:20px}.welcome-choices button{padding:11px}.welcome-choices small{font-size:11px}}
    `}</style>
  </div>;
}
