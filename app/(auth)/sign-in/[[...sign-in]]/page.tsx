import { redirect } from 'next/navigation'

// The custom login page is now at /login
export default function SignInPage() {
  redirect('/login')
}
