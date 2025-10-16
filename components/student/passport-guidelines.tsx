import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import Image from "next/image"

export function PassportGuidelines() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6">
        <h3 className="font-semibold text-lg mb-4">Passport Photo Requirements</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Plain White Background</p>
                <p className="text-sm text-muted-foreground">Background must be solid white or very light colored</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Fully Clothed</p>
                <p className="text-sm text-muted-foreground">Wear appropriate attire covering shoulders and chest</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Full Face Visible</p>
                <p className="text-sm text-muted-foreground">Face must be clearly visible and centered</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Single Person Only</p>
                <p className="text-sm text-muted-foreground">Only one person should appear in the photo</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Portrait Orientation</p>
                <p className="text-sm text-muted-foreground">Photo must be vertical (not horizontal)</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-medium text-sm">Example of Acceptable Photo:</p>
            <div className="relative w-full aspect-square border-2 border-dashed border-border rounded-lg p-4 bg-background">
              <Image fill src="/professional-passport-photo-white-background-forma.jpg" alt="Example passport photo" className="w-full h-auto rounded" />
            </div>
            <p className="text-xs text-muted-foreground">
              Professional passport-style photo with white background and formal attire
            </p>
          </div>
        </div>

        <Alert className="mt-4">
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Photos that do not meet these requirements will be automatically rejected. Please ensure your photo meets
            all criteria before uploading.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
