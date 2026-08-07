"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, GitBranch, Activity, AlertCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("projects")
          .select("*, incidents(count)")
          .order("created_at", { ascending: false })

        if (error) throw error
        if (data) setProjects(data)
      } catch (err) {
        console.error("Error fetching projects:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage your monitored applications and repositories.</p>
        </div>
        <Button className="gap-2">
          <Plus className="size-4" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-card">
          <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-4">
            <GitBranch className="size-6" />
          </div>
          <h3 className="text-lg font-medium">No projects configured</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Add a project and connect its GitHub repository to enable automatic root cause analysis.
          </p>
          <Button className="mt-6 gap-2">
            <Plus className="size-4" />
            Add Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:border-ring/50 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 mt-1.5">
                      <GitBranch className="size-3.5" />
                      {project.repository}
                    </CardDescription>
                  </div>
                  <Badge variant={project.status === 'healthy' ? 'success' : 'warning'}>
                    {project.status || 'healthy'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    {project.incidents?.[0]?.count > 0 ? (
                      <span className="flex items-center gap-1.5 text-warning">
                        <AlertCircle className="size-4" />
                        {project.incidents[0].count} open incidents
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-success">
                        <Activity className="size-4" />
                        No open incidents
                      </span>
                    )}
                  </div>
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
