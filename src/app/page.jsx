import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default function RootPage() {
  // DEMO MODE: always redirect to dashboard
  // In production: check w3l_user_auth cookie
  redirect('/dashboard')
}
