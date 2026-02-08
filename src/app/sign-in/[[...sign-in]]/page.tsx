import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-brand-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/tumaro-logo.png"
            alt="Tumaro"
            className="h-10 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-brand-400 mt-1">Sign in to your Tumaro account</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-brand-900 border border-brand-800 shadow-2xl',
              headerTitle: 'text-white',
              headerSubtitle: 'text-brand-400',
              socialButtonsBlockButton: 'bg-brand-800 border-brand-700 text-white hover:bg-brand-700',
              socialButtonsBlockButtonText: 'text-white',
              formFieldLabel: 'text-brand-300',
              formFieldInput: 'bg-brand-950 border-brand-700 text-white',
              formButtonPrimary: 'bg-accent-DEFAULT hover:bg-accent-hover',
              footerActionLink: 'text-accent-DEFAULT hover:text-accent-hover',
              identityPreview: 'bg-brand-800 border-brand-700',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-accent-DEFAULT',
              formFieldAction: 'text-accent-DEFAULT',
              dividerLine: 'bg-brand-700',
              dividerText: 'text-brand-500',
              footer: 'hidden',
            },
          }}
        />
      </div>
    </div>
  );
}
