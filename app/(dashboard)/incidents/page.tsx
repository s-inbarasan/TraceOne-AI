"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Filter, Clock, GitMerge, ChevronLeft, ChevronRight, Activity, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function IncidentsPage() {
  const [loading, setLoading] = useState(true)
  const [incidents, setIncidents] = useState<any[]>([])

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("incidents")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        if (data) setIncidents(data)
      } catch (err) {
        console.error("Error fetching incidents:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchIncidents()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Incidents</h1>
          <p className="text-sm text-muted-foreground">Manage and investigate grouped API errors.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex max-w-md flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search incidents by ID, title, or endpoint..." 
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="size-4" />
          Filter
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-4">
                <Activity className="size-6" />
              </div>
              <h3 className="text-lg font-medium">No incidents found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                No backend errors have been reported yet. Connect your applications to start monitoring.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/projects">View Projects</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border">
                {incidents.map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <Link href={`/incidents/${incident.id}`} className="font-semibold text-primary hover:underline">
                          {incident.id.split('-')[0] + '-' + incident.id.slice(0, 4)}
                        </Link>
                        <Badge variant={incident.severity === 'critical' ? 'destructive' : incident.severity === 'high' ? 'warning' : 'secondary'}>
                          {incident.severity}
                        </Badge>
                        <Badge variant={incident.status === 'resolved' ? 'success' : incident.status === 'investigating' ? 'default' : incident.status === 'ignored' ? 'outline' : 'secondary'}>
                          {incident.status}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium">{incident.title}</span>
                      <span className="font-mono text-xs text-muted-foreground">{incident.error_type}</span>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {new Date(incident.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-border p-4">
                <span className="text-sm text-muted-foreground">Showing 1-{incidents.length} of {incidents.length} incidents</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" disabled>
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button variant="outline" size="icon" disabled>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
