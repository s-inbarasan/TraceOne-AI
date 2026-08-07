import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GitPullRequest, Search, CheckCircle2, ShieldAlert, Cpu, Bot, GitCommit, FileCode2, Clock, GitMerge, Activity } from "lucide-react"

export default function InvestigationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">INC-9482</h1>
            <Badge variant="warning">High</Badge>
            <Badge variant="default">Investigating</Badge>
          </div>
          <h2 className="mt-1 text-lg font-medium">TypeError: Cannot read properties of undefined (reading &apos;map&apos;)</h2>
          <p className="mt-1 font-mono text-sm text-muted-foreground">GET /api/users/analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">View Raw Logs</Button>
          <Button>Re-run Analysis</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Bot className="size-5 text-primary" />
                AI Investigation
              </CardTitle>
              <CardDescription>
                TraceMind AI has analyzed the stack trace and repository context.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Root Cause Identified</h4>
                  <p className="text-sm leading-relaxed text-foreground">
                    The endpoint <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-primary-foreground">/api/users/analytics</code> relies on the <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-primary-foreground">AnalyticsService.getMetrics()</code> method. When a user has no prior history, the database query returns <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-primary-foreground">null</code> instead of an empty array. The controller attempts to call <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-primary-foreground">.map()</code> directly on this result, causing a TypeError.
                  </p>
                </div>
                
                <div className="flex items-center gap-6 rounded-md bg-secondary/50 p-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                    <div className="flex items-center gap-2 font-medium text-success">
                      <CheckCircle2 className="size-4" /> 98%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Regression Risk</div>
                    <div className="flex items-center gap-2 font-medium text-warning">
                      <ShieldAlert className="size-4" /> Low
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Affected Files</div>
                    <div className="flex items-center gap-2 font-medium">
                      <FileCode2 className="size-4 text-muted-foreground" /> 1 file
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Suggested Patch</CardTitle>
                  <CardDescription>Generated fix ready for review.</CardDescription>
                </div>
                <Button size="sm" variant="secondary" className="gap-2">
                  <GitPullRequest className="size-4" />
                  Create Pull Request
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="diff" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="diff">Unified Diff</TabsTrigger>
                  <TabsTrigger value="file">src/controllers/analytics.ts</TabsTrigger>
                </TabsList>
                <TabsContent value="diff" className="rounded-md border border-border bg-[#0d1117] p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-muted-foreground">
                    <code>
                      <div className="text-[#8b949e]">--- a/src/controllers/analytics.ts</div>
                      <div className="text-[#8b949e]">+++ b/src/controllers/analytics.ts</div>
                      <div className="text-[#8b949e]">@@ -45,7 +45,7 @@</div>
                      <div> export async function getAnalytics(req, res) {'{'}</div>
                      <div>   const userId = req.user.id;</div>
                      <div>   const rawMetrics = await AnalyticsService.getMetrics(userId);</div>
                      <div className="text-destructive bg-destructive/10">-  const formatted = rawMetrics.map(m =&gt; formatMetric(m));</div>
                      <div className="text-success bg-success/10">+  const formatted = (rawMetrics || []).map(m =&gt; formatMetric(m));</div>
                      <div>   </div>
                      <div>   return res.json({'{'} data: formatted {'}'});</div>
                      <div> {'}'}</div>
                    </code>
                  </pre>
                </TabsContent>
                <TabsContent value="file">
                  <div className="rounded-md border border-border bg-[#0d1117] p-4 font-mono text-sm text-muted-foreground h-[200px] flex items-center justify-center">
                    Full file view available in PR
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Investigation Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[15px] before:w-px before:bg-border">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 size-8 -translate-x-1/2 rounded-full border-4 border-background bg-secondary flex items-center justify-center">
                    <Activity className="size-3 text-muted-foreground" />
                  </div>
                  <h4 className="text-sm font-medium">Incident Detected</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">10:42 AM • 500 Internal Server Error</p>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 size-8 -translate-x-1/2 rounded-full border-4 border-background bg-primary/20 flex items-center justify-center">
                    <Search className="size-3 text-primary" />
                  </div>
                  <h4 className="text-sm font-medium">Analyzing Stack Trace</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">10:42 AM • Parsed 14 frames</p>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 size-8 -translate-x-1/2 rounded-full border-4 border-background bg-primary/20 flex items-center justify-center">
                    <Cpu className="size-3 text-primary" />
                  </div>
                  <h4 className="text-sm font-medium">Context Retrieval</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">10:43 AM • Fetched <span className="font-mono">src/controllers/analytics.ts</span></p>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 size-8 -translate-x-1/2 rounded-full border-4 border-background bg-success/20 flex items-center justify-center">
                    <Bot className="size-3 text-success" />
                  </div>
                  <h4 className="text-sm font-medium">Patch Generated</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">10:44 AM • Ready for review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Repository Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Repository</span>
                <span className="text-sm font-medium">acme-corp/api-gateway</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Branch</span>
                <span className="text-sm font-medium font-mono">main</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Commit</span>
                <span className="text-sm font-medium font-mono flex items-center gap-1">
                  <GitCommit className="size-3" />
                  a1b2c3d
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
