import { useState } from 'react'
import { signIn, signUp } from '../../lib/supabase'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const fn = isSignUp ? signUp : signIn
    const { error } = await fn(email, password)

    if (error) {
      setError(error.message)
    } else if (isSignUp) {
      setSuccess('Registrazione completata! Controlla la tua email per confermare.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo_zetabytenexus_458x379.jpeg" alt="ZetaBytesNexus" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-800">EnergiaAnalytica</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            {isSignUp ? 'Crea il tuo account' : 'Accedi per continuare'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="nome@esempio.it"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Almeno 6 caratteri"
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-xs text-rose-600 font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-xs text-emerald-600 font-medium">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSignUp ? 'Registrati' : 'Accedi'}
          </button>

          <p className="text-center text-xs text-slate-400 font-medium">
            {isSignUp ? 'Hai già un account?' : 'Non hai un account?'}{' '}
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null) }}
              className="text-blue-600 font-bold hover:underline"
            >
              {isSignUp ? 'Accedi' : 'Registrati'}
            </button>
          </p>
        </form>

        <p className="text-center text-[10px] text-slate-300 mt-6">
          ZetaBytesNexus &mdash; EnergiaAnalytica v1.0
        </p>
      </div>
    </div>
  )
}
