"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GitBranch, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState("")

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          setName(session.user.user_metadata?.full_name || "")
        }
      } catch (err) {
        console.error("Error fetching user:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleGitHubConnect = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'repo'
      }
    })
  }

  const isGitHubConnected = user?.app_metadata?.providers?.includes('github')

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and platform preferences.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information and email preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe" 
                className="max-w-md" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input 
                value={user?.email || ""} 
                disabled
                className="max-w-md bg-muted" 
              />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GitHub Integration</CardTitle>
            <CardDescription>Connect your GitHub account to enable repository access and PR creation.</CardDescription>
          </CardHeader>
          <CardContent>
            {isGitHubConnected ? (
              <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-card">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
                    <GitBranch className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">Connected as {user?.user_metadata?.user_name || 'GitHub User'}</p>
                    <p className="text-sm text-muted-foreground">Authorized for repository access</p>
                  </div>
                </div>
                <Button variant="outline">Manage Access</Button>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-4">
                <p className="text-sm text-muted-foreground">
                  You need to connect a GitHub account to allow TraceMind to open pull requests automatically.
                </p>
                <Button onClick={handleGitHubConnect} className="gap-2">
                  <GitBranch className="size-4" />
                  Connect GitHub Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
