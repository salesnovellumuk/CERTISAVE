import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import Step1Account     from './steps/Step1Account';
import Step2Company     from './steps/Step2Company';
import Step3Employees   from './steps/Step3Employees';
import Step4HowItWorks  from './steps/Step4HowItWorks';
import Step5Plan        from './steps/Step5Plan';
import Step6Payment     from './steps/Step6Payment';
import Step7Done        from './steps/Step7Done';
import './styles/signup.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const API = '/api';
const TOTAL_STEPS = 7;

const blankEmployee = () => ({
  first_name: '', last_name: '', email: '', phone: '',
  ni_number: '', date_of_birth: '', address_line_1: '', address_line_2: '',
  city: '', postcode: '', citb_test_id: '', certs: [],
});

function SignupInner() {
  const stripe   = useStripe();
  const elements = useElements();

  const [step, setStep]                   = useState(1);
  const [loading, setLoading]             = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError]                 = useState('');
  const [expandedEmp, setExpandedEmp]     = useState(0);

  const [clientSecret, setClientSecret] = useState('');
  const [account, setAccount]           = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [company, setCompany]           = useState({ accountType: '', name: '', trade: '', size: '' });
  const [employees, setEmployees]       = useState([blankEmployee()]);
  const [plan, setPlan]                 = useState('starter');

  const isSolo = plan === 'solo' || company.accountType === 'solo';

  const next = () => {
    setError('');
    setTransitioning(true);
    setTimeout(() => {
      setStep(s => Math.min(s + 1, TOTAL_STEPS));
      setTransitioning(false);
    }, 600);
  };

  const back = () => {
    setError('');
    setStep(s => Math.max(s - 1, 1));
  };

  const handleRegister = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/register/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name:   account.firstName,
          last_name:    account.lastName,
          email:        account.email,
          password:     account.password,
          company_name: 'Pending',
          plan:         'starter',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.email?.[0] || data.password?.[0] || data.detail || 'Something went wrong.');
      setClientSecret(data.client_secret);
      next();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleCompany = async () => {
    setLoading(true); setError('');
    try {
      // For sole traders, use their personal name as the "company name"
      const companyName = company.accountType === 'solo'
        ? `${account.firstName} ${account.lastName}`.trim()
        : company.name;

      const res = await fetch(`${API}/company/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: companyName }),
      });
      if (!res.ok) throw new Error('Could not save company details.');

      // Auto-set plan based on account type / team size
      if (company.accountType === 'solo') {
        setPlan('solo');
        // Pre-fill the single employee with their account name so Step 3 is one tap
        setEmployees([{
          ...blankEmployee(),
          first_name: account.firstName,
          last_name: account.lastName,
          email: account.email,
        }]);
      } else if (company.size === '16–50' || company.size === '50+') {
        setPlan('growth');
      } else {
        setPlan('starter');
      }
      next();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleEmployees = async () => {
    setLoading(true); setError('');
    try {
      const filled = employees.filter(e => e.first_name.trim());
      await Promise.all(filled.map(emp => {
        const { certs, ...fields } = emp;
        return fetch(`${API}/employees/`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...fields, date_of_birth: fields.date_of_birth || null }),
        });
      }));
      next();
    } catch { setError('Could not save employees. Please try again.'); }
    finally { setLoading(false); }
  };

  const handlePlan = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/company/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error('Could not save plan.');
      next();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handlePayment = async () => {
    if (!stripe || !elements) return;
    setLoading(true); setError('');
    try {
      const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (stripeError) throw new Error(stripeError.message);
      const res = await fetch(`${API}/payments/setup-complete/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method_id: setupIntent.payment_method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not complete setup.');
      next();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const showLoader = transitioning || (loading && step !== 6);

  return (
    <div className="signup-page">
      <a href="/" className="signup-logo">Certi<span>save</span></a>
      <div className="signup-card">
        <div className="signup-progress">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`signup-pip ${i + 1 <= step ? 'active' : ''}`} />
          ))}
        </div>

        {showLoader ? (
          <div className="signup-loading">
            <div className="signup-dots">
              <div className="signup-dot" />
              <div className="signup-dot" />
              <div className="signup-dot" />
            </div>
          </div>
        ) : (
          <>
            {step === 1 && <Step1Account account={account} setAccount={setAccount} onNext={handleRegister} loading={loading} error={error} />}
            {step === 2 && <Step2Company company={company} setCompany={setCompany} onNext={handleCompany} onBack={back} loading={loading} error={error} isSolo={isSolo} />}
            {step === 3 && <Step3Employees employees={employees} setEmployees={setEmployees} expandedEmp={expandedEmp} setExpandedEmp={setExpandedEmp} onNext={handleEmployees} onBack={back} loading={loading} error={error} isSolo={isSolo} />}
            {step === 4 && <Step4HowItWorks onNext={next} onBack={back} isSolo={isSolo} />}
            {step === 5 && <Step5Plan plan={plan} setPlan={setPlan} onNext={handlePlan} onBack={back} loading={loading} error={error} isSolo={isSolo} />}
            {step === 6 && <Step6Payment plan={plan} onNext={handlePayment} onBack={back} loading={loading} error={error} />}
            {step === 7 && <Step7Done />}
          </>
        )}
      </div>
    </div>
  );
}

export default function Signup() {
  return (
    <Elements stripe={stripePromise}>
      <SignupInner />
    </Elements>
  );
}