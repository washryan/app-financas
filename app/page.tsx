import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, BarChart3, CreditCard, DollarSign, PiggyBank, Shield, Smartphone, ChevronRight, CheckCircle2, TrendingUp, LineChart } from 'lucide-react'

export default async function Home() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full px-4 lg:px-6 h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between">
          <Link className="flex items-center justify-center" href="#">
            <PiggyBank className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-xl">Finanças Pessoais</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
              Funcionalidades
            </Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#benefits">
              Benefícios
            </Link>
          </nav>
          <div className="flex gap-4">
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="/login">
              Login
            </Link>
            <Link href="/register">
              <Button variant="default" size="sm" className="hidden sm:flex">
                Registrar
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted hero-pattern">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Controle suas finanças com <span className="gradient-text">facilidade</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Gerencie suas receitas, despesas e investimentos em um só lugar. Tenha controle total sobre suas
                    finanças pessoais e alcance seus objetivos financeiros.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="gap-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                    >
                      Começar agora
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="border-primary/20 hover:bg-primary/5">
                      Fazer login
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[450px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 p-4 md:p-8 shadow-lg border border-muted animate-float">
                  <div className="bg-background rounded-lg p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold">Resumo Financeiro</h3>
                        <p className="text-sm text-muted-foreground">Visão geral das suas finanças</p>
                      </div>
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-medium">Receitas</span>
                        </div>
                        <p className="text-lg font-bold text-emerald-500">R$ 5.240,00</p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="h-4 w-4 text-rose-500" />
                          <span className="text-sm font-medium">Despesas</span>
                        </div>
                        <p className="text-lg font-bold text-rose-500">R$ 3.180,00</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Alimentação</span>
                          <span className="font-medium">R$ 850,00</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: "28%" }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Moradia</span>
                          <span className="font-medium">R$ 1.200,00</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: "40%" }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Transporte</span>
                          <span className="font-medium">R$ 450,00</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: "15%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                Funcionalidades
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Tudo o que você precisa</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Gerencie suas finanças pessoais com ferramentas poderosas e intuitivas.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg p-6 border bg-card text-card-foreground shadow transition-all hover:shadow-lg feature-card">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Controle de Despesas</h3>
                <p className="text-center text-muted-foreground">
                  Registre e categorize suas despesas para saber exatamente para onde seu dinheiro está indo.
                </p>
                <Link href="/register" className="text-primary flex items-center text-sm hover:underline">
                  Saiba mais <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg p-6 border bg-card text-card-foreground shadow transition-all hover:shadow-lg feature-card">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Gestão de Receitas</h3>
                <p className="text-center text-muted-foreground">
                  Acompanhe suas fontes de renda e tenha uma visão clara de quanto dinheiro está entrando.
                </p>
                <Link href="/register" className="text-primary flex items-center text-sm hover:underline">
                  Saiba mais <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg p-6 border bg-card text-card-foreground shadow transition-all hover:shadow-lg feature-card">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <PiggyBank className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Metas Financeiras</h3>
                <p className="text-center text-muted-foreground">
                  Defina metas de economia e acompanhe seu progresso para alcançar seus objetivos financeiros.
                </p>
                <Link href="/register" className="text-primary flex items-center text-sm hover:underline">
                  Saiba mais <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Por que escolher nossa plataforma
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Por que escolher nossa plataforma?</h2>
                <p className="text-muted-foreground md:text-lg">
                  Nossa plataforma foi desenvolvida pensando na simplicidade e eficiência para ajudar você a tomar
                  melhores decisões financeiras.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Segurança e privacidade dos seus dados financeiros</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Acesse de qualquer dispositivo, a qualquer momento</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Relatórios detalhados e visualizações intuitivas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Suporte ao cliente rápido e eficiente</span>
                  </li>
                </ul>
                <div className="pt-4">
                  <Link href="/register">
                    <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
                      Comece a usar gratuitamente
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative h-[400px] overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 p-6 shadow-lg border border-muted">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="bg-background p-4 rounded-lg shadow-md animate-float">
                      <LineChart className="h-8 w-8 text-primary mb-2" />
                      <h3 className="font-medium">Análise de tendências</h3>
                      <p className="text-sm text-muted-foreground">Visualize padrões de gastos ao longo do tempo</p>
                    </div>
                    <div className="bg-background p-4 rounded-lg shadow-md animate-float [animation-delay:0.2s]">
                      <TrendingUp className="h-8 w-8 text-primary mb-2" />
                      <h3 className="font-medium">Previsões financeiras</h3>
                      <p className="text-sm text-muted-foreground">Planeje seu futuro financeiro com confiança</p>
                    </div>
                    <div className="bg-background p-4 rounded-lg shadow-md animate-float [animation-delay:0.4s]">
                      <Shield className="h-8 w-8 text-primary mb-2" />
                      <h3 className="font-medium">Dados seguros</h3>
                      <p className="text-sm text-muted-foreground">Criptografia de ponta a ponta para seus dados</p>
                    </div>
                    <div className="bg-background p-4 rounded-lg shadow-md animate-float [animation-delay:0.6s]">
                      <Smartphone className="h-8 w-8 text-primary mb-2" />
                      <h3 className="font-medium">Acesso móvel</h3>
                      <p className="text-sm text-muted-foreground">Gerencie suas finanças em qualquer lugar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Pronto para começar?</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Comece a transformar suas finanças hoje mesmo com nossa plataforma intuitiva.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="gap-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                  >
                    Criar conta gratuita
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-primary/20 hover:bg-primary/5">
                    Fazer login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:justify-between">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-primary" />
              <span className="font-semibold">Finanças Pessoais</span>
            </Link>
            <p className="text-sm text-muted-foreground">© 2025 Finanças Pessoais. Todos os direitos reservados.</p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Produto</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Funcionalidades
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Preços
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Empresa</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Sobre nós
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Termos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
