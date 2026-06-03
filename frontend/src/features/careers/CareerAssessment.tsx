import { useState } from 'react';
import { Card, Button } from '../../components';
import { studentService } from '../../services';
import { notify } from '../../lib/toast';
import { Brain, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QUESTIONS = [
  { id: 'q1', text: 'I enjoy building things or working with my hands.', category: 'Realistic' },
  { id: 'q2', text: 'I like analyzing data and solving complex problems.', category: 'Investigative' },
  { id: 'q3', text: 'I express myself creatively through art, writing, or design.', category: 'Artistic' },
  { id: 'q4', text: 'I find fulfillment in helping, teaching, or mentoring others.', category: 'Social' },
  { id: 'q5', text: 'I enjoy leading teams, managing projects, or starting businesses.', category: 'Enterprising' },
  { id: 'q6', text: 'I prefer organized, structured tasks with clear rules.', category: 'Conventional' },
  { id: 'q7', text: 'I am comfortable learning new software or technical skills quickly.', category: 'Technical' }
];

export const CareerAssessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (score: number) => {
    const questionId = QUESTIONS[currentStep].id;
    setAnswers(prev => ({ ...prev, [questionId]: score }));

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitAssessment({ ...answers, [questionId]: score });
    }
  };

  const submitAssessment = async (finalAnswers: Record<string, number>) => {
    setIsSubmitting(true);
    try {
      await studentService.takeAssessment({ answers: finalAnswers });
      setIsComplete(true);
      notify.success('Assessment completed! AI is analyzing your profile.');
    } catch (error: any) {
      notify.error(error.message || 'Failed to submit assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto mt-12 animate-fade-in">
        <Card className="text-center p-12 flex flex-col items-center border border-emerald-100 shadow-lg">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold font-outfit text-[#146C94] mb-4">Assessment Complete!</h2>
          <p className="text-slate-600 mb-8 max-w-md">
            Thank you. Emmerence AI has successfully analyzed your responses and updated your profile vector. 
            Your new career recommendations are ready.
          </p>
          <Button 
            onClick={() => navigate('/recommendations')}
            className="bg-[#146C94] hover:bg-[#19A7CE] px-8"
            leftIcon={<Brain size={18} />}
          >
            View AI Recommendations
          </Button>
        </Card>
      </div>
    );
  }

  const progress = ((currentStep) / QUESTIONS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto mt-8 animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold font-outfit text-[#146C94] flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-[#19A7CE]" />
          AI Career Assessment
        </h2>
        <p className="text-slate-500 mt-2">Discover your ideal career path through our RIASEC-based evaluation.</p>
      </div>

      <Card className="p-8 shadow-md border-slate-200">
        <div className="mb-8">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}% Completed</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#19A7CE] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="min-h-[200px] flex flex-col justify-center mb-8">
          <h3 className="text-2xl font-bold text-slate-700 text-center leading-relaxed">
            "{QUESTIONS[currentStep].text}"
          </h3>
          <p className="text-center text-xs text-slate-400 mt-4 uppercase font-bold tracking-widest">
            {QUESTIONS[currentStep].category}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { label: 'Strongly Disagree', value: 1, color: 'hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600' },
            { label: 'Disagree', value: 2, color: 'hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600' },
            { label: 'Neutral', value: 3, color: 'hover:bg-slate-50 hover:border-slate-300 hover:text-slate-600' },
            { label: 'Agree', value: 4, color: 'hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600' },
            { label: 'Strongly Agree', value: 5, color: 'hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              disabled={isSubmitting}
              className={`py-4 px-2 rounded-xl border-2 border-slate-100 bg-white text-slate-600 font-semibold text-sm transition-all duration-200 ${option.color} flex flex-col items-center justify-center gap-2`}
            >
              <span className="text-lg">{option.value}</span>
              <span className="text-[10px] uppercase tracking-wider text-center">{option.label}</span>
            </button>
          ))}
        </div>
      </Card>
      
      <div className="mt-6 flex justify-between items-center text-sm text-slate-400 px-4">
        <button 
          onClick={() => currentStep > 0 && setCurrentStep(prev => prev - 1)}
          className={`hover:text-slate-600 transition-colors ${currentStep === 0 ? 'invisible' : ''}`}
        >
          ← Previous Question
        </button>
        <span className="flex items-center gap-1">
          Powered by Emmerence Engine <Brain size={14} className="text-[#19A7CE]" />
        </span>
      </div>
    </div>
  );
};
