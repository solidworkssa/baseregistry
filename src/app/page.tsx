"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Database, ShieldCheck } from "lucide-react"

export default function Home() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState("")
  const [data, setData] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !data) {
      toast.error("Please fill in all fields")
      return
    }

    setIsRegistering(true)
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRegistering(false)
    toast.success("Successfully registered to Base!")
    setName("")
    setData("")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-10 transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-foreground text-background rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            BaseRegistry
          </div>
          <Button variant="outline" onClick={() => toast("Wallet connectivity coming soon")} className="scale-100 hover:scale-105 transition-transform">
            Connect Wallet
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center gap-12">
        <div className="text-center space-y-6 max-w-3xl animate-in slide-in-from-bottom-5 fade-in duration-700">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground pb-2">
            Immutable Data Registry
          </h1>
          <p className="text-muted-foreground text-lg md:text-2xl font-light">
            Securely register and manage your data on the Base ecosystem. <br className="hidden md:block" />Simple, fast, and decentralized.
          </p>
        </div>

        <div className="w-full max-w-md animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-150">
          <Card className="shadow-2xl border-muted/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Register New Entry</CardTitle>
              <CardDescription>Enter the details you wish to store on-chain.</CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name Key</Label>
                  <Input
                    id="name"
                    placeholder="e.g. my-dataset-v1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data Payload</Label>
                  <Input
                    id="data"
                    placeholder="IPFS Hash or raw string"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="h-12 bg-background/50"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full h-12 text-lg hover:shadow-lg transition-all" disabled={isRegistering}>
                  {isRegistering ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-5 w-5" />
                      Register to Chain
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl pt-8 text-center text-muted-foreground border-t animate-in fade-in duration-1000 delay-300">
          <div>
            <h3 className="text-foreground font-semibold text-xl mb-2">Secure</h3>
            <p>Built on Base for L2 security and Ethereum compatibility.</p>
          </div>
          <div>
            <h3 className="text-foreground font-semibold text-xl mb-2">Fast</h3>
            <p>Low latency transactions with instant finality.</p>
          </div>
          <div>
            <h3 className="text-foreground font-semibold text-xl mb-2">Simple</h3>
            <p>Minimalist interface for maximum efficiency.</p>
          </div>
        </div>

      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground bg-muted/20">
        <p>© {new Date().getFullYear()} BaseRegistry. Built on Base . Beta Version.</p>
      </footer>
    </div>
  )
}
