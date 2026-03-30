'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Eye, EyeOff, Loader2, Stethoscope } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Ambil callbackUrl dan pastikan hanya redirect ke internal path demi keamanan
  const rawCallbackUrl = searchParams.get('callbackUrl') || '/'
  const callbackUrl = rawCallbackUrl.startsWith('/') ? rawCallbackUrl : '/'
  
  const error = searchParams.get('error')

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(
    error === 'CredentialsSignin' ? 'Email atau password salah' : 
    error ? 'Terjadi kesalahan saat login' : null
  )

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setFormError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setFormError('Email atau password salah')
        setIsLoading(false)
        return
      }

      // Gunakan 'as any' untuk membungkam error typedRoutes pada dynamic string
      router.push(callbackUrl as any)
      router.refresh()
    } catch (err) {
      setFormError('Terjadi kesalahan sistem. Silakan coba lagi.')
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl text-center">Masuk</CardTitle>
        <CardDescription className="text-center">
          Masukkan email dan password akun MedRef Anda
        </CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {formError && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="dokter@medref.id"
              required
              disabled={isLoading}
              autoComplete="email"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-xs text-emerald-600 hover:underline">Lupa password?</a>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                disabled={isLoading}
                autoComplete="current-password"
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-0">
          <Button
            type="submit"
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              'Masuk ke MedRef'
            )}
          </Button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Belum punya akses?{' '}
            <a
              href="/register"
              className="text-emerald-600 hover:text-emerald-700 font-bold"
            >
              Daftar Sekarang
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white mb-4 shadow-lg ring-4 ring-white dark:ring-gray-800">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">MedRef</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">Portal Referensi Medis & Farmakologi</p>
        </div>

        {/* Suspense is required when using useSearchParams in Client Components */}
        <Suspense fallback={
          <Card className="shadow-xl border-0 p-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </Card>
        }>
          <LoginForm />
        </Suspense>

        {/* Footer Info */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 px-4">
          Aplikasi ini khusus untuk tenaga kesehatan profesional. Dengan masuk, Anda menyetujui{' '}
          <a href="/terms" className="underline hover:text-emerald-600">Syarat Layanan</a> dan{' '}
          <a href="/privacy" className="underline hover:text-emerald-600">Kebijakan Privasi</a>.
        </p>
      </div>
    </div>
  )
}