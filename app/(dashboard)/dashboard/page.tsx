"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, AlertCircle, ArrowRight, CheckCircle2, Clock, GitPullRequest, GitMerge, Loader2, Bot } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ openIncidents: 0, resolvedToday: 0, aiAccuracy: 0, pendingPRs: 0 })
  const [recentIncidents, setRecentIncidents] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const supabase = createClient()
        // Simulate real data fetching. 
        // We catch errors to avoid breaking if tables aren't perfectly synced in this sandbox.
        const { data: incidents, error: incidentsError } = await supabase
          .from("incidents")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5)

        if (incidentsError) throw incidentsError

        if (incidents) {
          setRecentIncidents(incidents)
          setStats({
            openIncidents: incidents.filter(i => i.status === 'open').length,
            resolvedToday: incidents.filter(i => i.status === 'resolved').length, // Simplified
            aiAccuracy: 0,
            pendingPRs: 0
          })
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const hasData = recentIncidents.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground">Monitor and investigate system health across your projects.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <AlertCircle className="size-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openIncidents}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently open</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="size-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolvedToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Recently resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
            <Activity className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hasData ? `${stats.aiAccuracy}%` : 'N/A'}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on accepted patches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending PRs</CardTitle>
            <GitPullRequest className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPRs}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting merge</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>
              API failures automatically captured and grouped.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasData ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-4">
                  <Activity className="size-6" />
                </div>
                <h3 className="text-lg font-medium">No incidents detected</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Everything looks healthy. We will automatically investigate any API failures as they occur.
                </p>
                <Button variant="outline" className="mt-6" asChild>
                  <Link href="/projects">Configure Projects</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentIncidents.map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-4 shadow-sm transition-colors hover:bg-secondary/20">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <Link href={`/incidents/${incident.id}`} className="font-semibold text-primary hover:underline">
                          {incident.id.split('-')[0] + '-' + incident.id.slice(0, 4)}
                        </Link>
                        <Badge variant={incident.severity === 'critical' ? 'destructive' : incident.severity === 'high' ? 'warning' : 'secondary'}>
                          {incident.severity}
                        </Badge>
                        <Badge variant={incident.status === 'resolved' ? 'success' : incident.status === 'investigating' ? 'default' : 'secondary'}>
                          {incident.status}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium">{incident.title}</span>
                      <span className="font-mono text-xs text-muted-foreground">{incident.error_type}</span>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {new Date(incident.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4">
                  <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground" asChild>
                    <Link href="/incidents">
                      View all incidents <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>AI Investigations</CardTitle>
            <CardDescription>
              Recently generated patches and root cause analyses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasData ? (
              <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-4">
                  <Bot className="size-6" />
                </div>
                <h3 className="text-sm font-medium">No active investigations</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  When incidents occur, the AI agent will analyze the root cause here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-sm text-muted-foreground">Recent investigation history will appear here.</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
