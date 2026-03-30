"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"

export function DarkModeDemo() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dark Mode Demo</h1>
        <ModeToggle />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Primary Card</CardTitle>
            <CardDescription>This card demonstrates primary styling</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badges & Status</CardTitle>
            <CardDescription>Various badge components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>Text styling in different themes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-semibold">Large Text</p>
              <p className="text-base">Regular Text</p>
              <p className="text-sm text-muted-foreground">Muted Text</p>
              <p className="text-xs">Small Text</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dark Mode Features</CardTitle>
          <CardDescription>
            Toggle between light, dark, and system themes using the button in the top right.
            The theme will automatically adapt to your system preferences when set to &ldquo;System&rdquo;.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Automatic system theme detection</li>
            <li>Smooth transitions between themes</li>
            <li>Consistent color scheme across all components</li>
            <li>Accessible contrast ratios in both themes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
