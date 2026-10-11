import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Calendar,
  Heart,
  Droplet,
  Sparkles,
  Info
} from 'lucide-react';

export const QUIZ_QUESTIONS = [
  {
    id: 'age_weight',
    title: 'Age & Body Weight',
    question: 'Are you at least 17 years old (or 16 with parental consent) and weigh at least 110 lbs (50 kg)?',
    context: 'Standard safety guideline to ensure donor blood volume is sufficient and recovery is rapid without lightheadedness.',
    desiredAnswer: true,
    deferralMessage: 'Donors must be at least 17 years of age (or 16 in select states with signed parental consent) and weigh at least 110 lbs (50 kg) to donate safely.',
    deferralType: 'permanent_or_until_eligible',
  },
  {
    id: 'feeling_well',
    title: 'Current Health & Wellness',
    question: 'Are you currently feeling well, active, and symptom-free today (no fever, flu, active cold, or sore throat)?',
    context: 'Donors must be in good general health on the day of donation to protect both themselves and immunocompromised blood recipients.',
    desiredAnswer: true,
    deferralMessage: 'Please wait until you are fully symptom-free and fever-free for at least 24 hours before donating.',
    deferralType: 'temporary_short',
  },
  {
    id: 'donation_interval',
    title: 'Donation Interval',
    question: 'Has it been at least 56 days (8 weeks) since your last whole blood donation (or is this your very first time)?',
    context: 'The human body takes approximately 4 to 8 weeks to replenish red blood cells and iron stores after whole blood donation.',
    desiredAnswer: true,
    deferralMessage: 'Federal health standards require a 56-day rest period between whole blood donations (or 112 days for automated double red cells) to allow your red blood cells to regenerate.',
    deferralType: 'temporary_interval',
  },
  {
    id: 'medications',
    title: 'Medications & Antibiotics',
    question: 'Are you currently FREE of oral antibiotics for an active bacterial infection and NOT taking prescription blood thinners?',
    context: 'Taking antibiotics indicates an active infection in the bloodstream. Most routine medications like blood pressure, birth control, or thyroid meds are totally fine.',
    desiredAnswer: true,
    deferralMessage: 'You must complete your full course of oral antibiotics and wait 48 hours symptom-free before donating.',
    deferralType: 'temporary_medication',
  },
  {
    id: 'tattoos_travel',
    title: 'Tattoos, Piercings & Malaria Travel',
    question: 'In the past 3 months, have you avoided unlicensed tattoos/piercings, and in the past 12 months, avoided travel to high-risk malaria zones?',
    context: 'Tattoos from state-licensed commercial facilities in most states are acceptable immediately. Travel deferrals prevent transfusion-transmitted vector infections.',
    desiredAnswer: true,
    deferralMessage: 'A temporary deferral of 3 months applies for unlicensed body modifications, or 12 months following return from malaria-endemic areas.',
    deferralType: 'temporary_travel',
  },
  {
    id: 'pregnancy_surgery',
    title: 'Pregnancy & Major Surgery',
    question: 'Are you currently NOT pregnant (at least 6 weeks postpartum) and have NOT had major surgery under general anesthesia in the past 6 months?',
    context: 'Pregnancy requires high maternal iron reserves. Post-surgical recovery requires the body to rebuild hemoglobin first.',
    desiredAnswer: true,
    deferralMessage: 'Donors must wait at least 6 weeks after giving birth, and until full surgical incision recovery is certified by their physician.',
    deferralType: 'temporary_recovery',
  },
];

export default function DonorEligibilityQuiz({
  currentDonor,
  onEligibilityPassed,
  onClose
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalQuestions = QUIZ_QUESTIONS.length;
  const currentQ = QUIZ_QUESTIONS[currentStep];

  const handleSelectAnswer = (value) => {
    const updatedAnswers = {
      ...answers,
      [currentQ.id]: value,
    };
    setAnswers(updatedAnswers);

    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
      setShowExplanation(false);
    } else {
      setIsCompleted(true);
    }
  };

  // Evaluate final result
  const evaluation = React.useMemo(() => {
    const deferrals = [];
    for (const q of QUIZ_QUESTIONS) {
      const userAns = answers[q.id];
      if (userAns !== undefined && userAns !== q.desiredAnswer) {
        deferrals.push({
          title: q.title,
          message: q.deferralMessage,
          type: q.deferralType,
        });
      }
    }

    const isEligible = deferrals.length === 0;
    return {
      isEligible,
      deferrals,
    };
  }, [answers]);

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
    setIsCompleted(false);
    setShowExplanation(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#12070a]/95 rounded-3xl border border-red-500/20 shadow-2xl p-6 sm:p-8 animate-fade-in space-y-6 text-slate-100 backdrop-blur-2xl">
      {/* Quiz Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.4)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950 border border-red-700/40 text-red-400 text-[10px] font-black uppercase tracking-wider mb-1">
              🩺 30-SEC VIBE CHECK
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Donor Safety & Eligibility Vibe Check
            </h2>
            <p className="text-xs text-zinc-400">
              Compliant with FDA & Red Cross blood donation safety guidelines
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-white/10 text-xs font-bold transition cursor-pointer"
          >
            ✕ Close
          </button>
        )}
      </div>

      {!isCompleted ? (
        <div className="space-y-6">
          {/* Progress Bar & Counter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-zinc-400 uppercase tracking-wider">
              <span>Question {currentStep + 1} of {totalQuestions}</span>
              <span className="text-red-400 font-extrabold">{Math.round(((currentStep + 1) / totalQuestions) * 100)}% Completed</span>
            </div>
            <div className="w-full h-2.5 bg-black/60 border border-white/10 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-crimson-500 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(220,38,38,0.8)]"
                style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="p-6 rounded-2xl bg-black/50 border border-white/10 space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-red-400">
              {currentQ.title}
            </span>
            <h3 className="text-base sm:text-xl font-black text-white leading-snug">
              {currentQ.question}
            </h3>

            {/* Why we ask this toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-xs font-bold text-zinc-400 hover:text-red-300 flex items-center gap-1 transition cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                {showExplanation ? 'Hide safety context' : 'Why is this asked? (No cap)'}
              </button>

              {showExplanation && (
                <div className="mt-2.5 p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-zinc-300 leading-relaxed animate-fade-in flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{currentQ.context}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Choice Buttons */}
          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <button
              onClick={() => handleSelectAnswer(true)}
              className="py-4 px-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/50 hover:border-emerald-400 text-emerald-200 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Yes, I meet this
            </button>

            <button
              onClick={() => handleSelectAnswer(false)}
              className="py-4 px-4 rounded-2xl border-2 border-red-500/40 bg-red-950/30 hover:bg-red-900/50 hover:border-red-400 text-red-200 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition active:scale-95 shadow-[0_0_15px_rgba(220,38,38,0.2)] cursor-pointer"
            >
              <XCircle className="w-5 h-5 text-red-400" /> No, I do not
            </button>
          </div>

          {/* Navigation Back button */}
          {currentStep > 0 && (
            <div className="flex justify-start pt-2">
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous Question
              </button>
            </div>
          )}
        </div>
      ) : (
        /* QUIZ RESULTS VIEW */
        <div className="space-y-6 animate-scale-in">
          {evaluation.isEligible ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-3.5 py-1 rounded-full border border-emerald-500/40">
                  Pre-Screening Passed • 100% Eligible
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  You are Medically Cleared to Donate!
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-md mx-auto">
                  Awesome {currentDonor?.name || 'Lifesaver'}! Based on standard American Red Cross & FDA criteria, your health profile is cleared for life-saving donation.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-left text-xs space-y-2 text-emerald-200">
                <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Pre-Donation Quick Checklist:
                </div>
                <p>✓ Drink 16 oz (500 ml) of water 2 hours before donation</p>
                <p>✓ Have a hearty, non-fatty meal rich in iron (beans, lean protein, spinach)</p>
                <p>✓ Bring your state or student photo ID to the donation desk</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => {
                    if (onEligibilityPassed) onEligibilityPassed();
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(220,38,38,0.6)] border border-red-400/40 flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Calendar className="w-4 h-4" /> Schedule Donation Appointment Now
                </button>

                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-white/10 text-zinc-300 font-bold text-xs hover:bg-white/10 flex items-center justify-center gap-1.5 cursor-pointer transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Vibe Check
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                <AlertCircle className="w-10 h-10" />
              </div>

              <div className="text-center">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 px-3.5 py-1 rounded-full border border-amber-500/40">
                  Temporary Deferral Notice
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-3">
                  Temporary Safety Pause
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-md mx-auto">
                  Based on your responses, you are temporarily deferred from donating today to protect your health and recipients.
                </p>
              </div>

              {/* Deferral Reasons Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-black text-zinc-400 uppercase tracking-wider block">Identified Criteria:</span>
                {evaluation.deferrals.map((def, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 space-y-1"
                  >
                    <div className="font-black text-amber-300">{def.title}</div>
                    <p className="text-zinc-300 leading-relaxed">{def.message}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-xs text-zinc-300 space-y-1">
                <strong className="text-white">You can still save lives:</strong>
                <p>• Share emergency requests with squad friends on WhatsApp/Discord/TikTok.</p>
                <p>• Recheck your status once your deferral period has expired.</p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 shadow flex items-center gap-1.5 cursor-pointer transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Questionnaire
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
