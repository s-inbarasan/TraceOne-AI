"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Activity, 
  Settings, 
  GitPullRequest, 
  Bug, 
  LayoutDashboard,
  Box,
  Key
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GithubIcon } from "@/components/ui/icons"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Incidents", href: "/incidents", icon: Activity },
  { name: "Investigations", href: "/investigations", icon: Bug },
  { name: "Pull Requests", href: "/pull-requests", icon: GitPullRequest },
]

const configuration = [
  { name: "Projects", href: "/projects", icon: Box },
  { name: "API Keys", href: "/settings/keys", icon: Key },
  { name: "GitHub Setup", href: "/github-setup", icon: GithubIcon },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
          </div>
          <span className="tracking-tight">Trace One</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <item.icon className="size-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="mt-8">
          <div className="mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Configuration
          </div>
          <nav className="space-y-1 px-3">
            {configuration.map((item) => {
              const isActive = pathname === item.href || (pathname ? pathname.startsWith(item.href + '/') : false)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
