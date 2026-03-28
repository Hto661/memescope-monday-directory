import { SubmitForm } from '@/components/SubmitForm';

export const metadata = {
  title: 'Submit a Coin | Memescope Monday',
  description: 'Submit your memecoin pick for Memescope Monday. Solana, Base, and BNB Chain accepted.',
};

export default function SubmitPage() {
  return (
    <div>
      <div className="bg-gradient-to-b from-navy-50 to-white border-b border-navy-100">
        <div className="container-main py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-navy-900 mb-3">
            Submit a Coin
          </h1>
          <p className="text-navy-500 max-w-lg mx-auto">
            Got a memecoin pick for the next Memescope Monday? Submit it here and let the community discover it.
          </p>
        </div>
      </div>

      <div className="container-main py-10">
        <div className="max-w-2xl mx-auto">
          {/* Info box */}
          <div className="card p-5 bg-blue-50 border-blue-200 mb-8">
            <h3 className="font-bold text-blue-900 text-sm mb-2">How it works</h3>
            <ul className="text-sm text-blue-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">1.</span>
                Fill out the form below with your coin details
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">2.</span>
                Your submission will be reviewed by the community
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">3.</span>
                Approved coins appear in the directory for the next Memescope Monday
              </li>
            </ul>
          </div>

          <SubmitForm />
        </div>
      </div>
    </div>
  );
}
