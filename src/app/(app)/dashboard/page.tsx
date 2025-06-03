import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Activity, Users, Truck, ShieldCheck, Wrench } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";


const dailyOpsData = [
  { name: 'Mon', ops: 4, maint: 2 },
  { name: 'Tue', ops: 3, maint: 1 },
  { name: 'Wed', ops: 5, maint: 3 },
  { name: 'Thu', ops: 2, maint: 2 },
  { name: 'Fri', ops: 6, maint: 1 },
  { name: 'Sat', ops: 3, maint: 0 },
  { name: 'Sun', ops: 1, maint: 1 },
];

const chartConfig = {
  ops: {
    label: "Operations",
    color: "hsl(var(--primary))",
  },
  maint: {
    label: "Maintenances",
    color: "hsl(var(--accent))",
  },
} satisfies import("@/components/ui/chart").ChartConfig;


export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Vehicles Operative"
          value="8"
          icon={Truck}
          description="Out of 10 total"
          iconClassName="text-green-500"
        />
        <StatCard
          title="Active Tasks"
          value="12"
          icon={Activity}
          description="3 overdue"
          iconClassName="text-blue-500"
        />
        <StatCard
          title="Personnel Available"
          value="9"
          icon={Users}
          description="Out of 11 total"
          iconClassName="text-green-500"
        />
        <StatCard
          title="Equipment Ready"
          value="45"
          icon={ShieldCheck}
          description="ERA & Extinguishers"
          iconClassName="text-teal-500"
        />
        <StatCard
          title="Active Alerts"
          value="2"
          icon={AlertTriangle}
          description="Require immediate attention"
          iconClassName="text-red-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Daily Operations & Maintenance</CardTitle>
            <CardDescription>Summary for the current week.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyOpsData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <ChartTooltip
                    content={<ChartTooltipContent hideLabel className="bg-background text-foreground border-border shadow-lg" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="ops" fill="var(--color-ops)" radius={4} />
                  <Bar dataKey="maint" fill="var(--color-maint)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription>Log of recent important events.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Vehicle #3 (Patente AB-CD-12) returned from maintenance.</span>
              </li>
              <li className="flex items-start">
                <Activity className="h-4 w-4 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                <span>New task "Equipment Check Drill" assigned to Team Alpha.</span>
              </li>
              <li className="flex items-start">
                <Wrench className="h-4 w-4 mr-2 mt-0.5 text-yellow-600 flex-shrink-0" />
                <span>ERA Unit #E007 scheduled for inspection tomorrow.</span>
              </li>
              <li className="flex items-start">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-red-500 flex-shrink-0" />
                <span>Low fuel warning for Vehicle #5.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
