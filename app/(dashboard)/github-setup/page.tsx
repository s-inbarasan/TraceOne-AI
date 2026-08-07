"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, GitBranch, Lock, FileCode, CheckCircle, Search } from "lucide-react"

export default function GitHubSetupPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">GitHub Setup & Security</h1>
        <p className="text-muted-foreground">
          Understanding how Trace One interacts with your repositories and protects your data.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              <CardTitle>Why GitHub OAuth?</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Trace One uses GitHub OAuth to securely authenticate you and connect your repositories without ever storing your GitHub password. This allows Trace One to seamlessly transition from identifying runtime API errors to generating deployable code patches in your codebase.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="size-5 text-primary" />
              <CardTitle>Repository Permissions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We request the <code className="bg-muted px-1 rounded">repo</code> scope to allow Trace One to read your codebase to find the root cause of issues, and to open Pull Requests on your behalf once a fix is generated. 
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="size-5 text-primary" />
              <CardTitle>Public vs. Private Repositories</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              GitHub&apos;s standard OAuth scopes bundle public and private repository access together. However, Trace One will <strong>never</strong> access any repository, public or private, unless you explicitly select and authorize it within the Trace One dashboard.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="size-5 text-primary" />
              <CardTitle>How Trace One Analyzes Code</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              When an incident occurs, Trace One securely fetches only the relevant source files related to the error stack trace. This code is temporarily passed to your configured LLM for root-cause analysis and patch generation, and is not stored permanently on our servers.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="size-5 text-success" />
              <CardTitle>Your Control & Privacy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <li className="flex items-start gap-2">
                <FileCode className="size-4 mt-0.5 shrink-0" />
                <span>Code is only accessed after explicit user authorization per project.</span>
              </li>
              <li className="flex items-start gap-2">
                <FileCode className="size-4 mt-0.5 shrink-0" />
                <span>We only request the minimum permissions required to automate PR creation.</span>
              </li>
              <li className="flex items-start gap-2">
                <FileCode className="size-4 mt-0.5 shrink-0" />
                <span>Tokens are encrypted at rest and securely managed via Supabase Auth.</span>
              </li>
              <li className="flex items-start gap-2">
                <FileCode className="size-4 mt-0.5 shrink-0" />
                <span>You can disconnect GitHub at any time from your settings or revoke access directly in GitHub.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
