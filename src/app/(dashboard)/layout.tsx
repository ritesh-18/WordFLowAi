import { Sidebar } from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      {/* pb-20 on mobile to clear the bottom tab bar */}
      <div className="flex-1 flex flex-col overflow-hidden pb-20 md:pb-0">
        {children}
      </div>
    </div>
  )
}
