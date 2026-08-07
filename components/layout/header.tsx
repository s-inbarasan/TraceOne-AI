"use client"

import { Button } from "@/components/ui/button"
import { Bell, Search } from "lucide-react"

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="flex max-w-md flex-1 items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-1.5 text-sm text-muted-foreground transition-colors focus-within:border-ring focus-within:bg-transparent focus-within:text-foreground">
          <Search className="size-4 shrink-0" />
          <input 
            type="text" 
            placeholder="Search projects, incidents, or pull requests... (Press '/')" 
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="size-4" />
          <span className="sr-only">Notifications</span>
        </Button>
        <div className="size-8 rounded-full bg-secondary ring-1 ring-border flex items-center justify-center text-xs font-medium">
          JD
        </div>
      </div>
    </header>
  )
}
