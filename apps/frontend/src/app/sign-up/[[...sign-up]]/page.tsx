import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">POS SaaS</h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
              footerActionLink: 'text-blue-600 hover:text-blue-700',
            },
          }}
          redirectUrl="/onboarding"
        />
      </div>
    </div>
  )
}