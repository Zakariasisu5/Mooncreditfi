import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NarratedDemoPlayer from '@/components/NarratedDemoPlayer';
import { 
  ChevronRight, 
  ChevronLeft, 
  Home, 
  User, 
  Landmark, 
  Cpu, 
  Shield, 
  Clock,
  Mic,
  ExternalLink,
  CheckCircle2,
  Target,
  Zap,
  Globe,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Brain,
  Play
} from 'lucide-react';

const demoSections = [
  {
    id: 'opening',
    title: 'Opening',
    duration: '20-30 sec',
    icon: Mic,
    navTo: '/',
    navLabel: 'Show Landing Page',
    script: [
      '"Hi everyone, this is MoonCreditFi."',
      '"We\'re building a credit-aware DeFi and DePIN protocol aligned with the Creditcoin ecosystem."',
      '"The core idea is simple: on-chain credit history should unlock access to capital, not just collateral."'
    ],
    action: 'Scroll hero section slowly',
    keySignal: null
  },
  {
    id: 'problem',
    title: 'The Problem',
    duration: '30 sec',
    icon: AlertCircle,
    navTo: '/',
    navLabel: 'Show Problem Section',
    script: [
      '"Today, most DeFi lending protocols require users to over-collateralize."',
      '"If you don\'t already have capital, you\'re locked out — even if you\'re trustworthy."',
      '"At the same time, DePIN projects struggle to raise capital because ownership, impact, and revenue distribution are often unclear and off-chain."'
    ],
    action: 'Scroll to "Problem" or value section',
    keySignal: null
  },
  {
    id: 'solution',
    title: 'Our Solution Overview',
    duration: '30 sec',
    icon: Lightbulb,
    navTo: '/',
    navLabel: 'Show Features Section',
    script: [
      '"MoonCreditFi solves both problems by extending Creditcoin\'s credit-first vision into a working DeFi and DePIN system."',
      '"We introduce wallet-based credit profiles, reputation-driven lending pools, and transparent funding for real-world infrastructure — all enforced on-chain."'
    ],
    action: 'Scroll to features/solution section',
    keySignal: null
  },
  {
    id: 'ai-engine',
    title: 'AI Credit Risk Engine',
    duration: '45 sec',
    icon: Brain,
    navTo: '/dashboard/credit',
    navLabel: 'Show AI Analysis',
    script: [
      '"At the heart of MoonCreditFi is our AI Credit Risk Engine."',
      '"It analyzes on-chain wallet behavior using machine learning, not static rules."',
      '"The engine evaluates transaction patterns, repayment history, and DeFi interactions to generate transparent, explainable credit scores."',
      '"This enables fair access to credit for underbanked users who lack traditional credit history."'
    ],
    action: 'Navigate to Credit Profile, trigger AI Analysis',
    keySignal: '"AI-powered, transparent, explainable"'
  },
  {
    id: 'credit-profile',
    title: 'Credit Profile Flow',
    duration: '45 sec',
    icon: User,
    navTo: '/dashboard/credit',
    navLabel: 'Open Credit Profile',
    script: [
      '"Every wallet interacting with MoonCreditFi has an on-chain credit profile."',
      '"This profile tracks loan history, repayment behavior, and overall reputation."',
      '"There\'s no manual scoring — everything updates automatically through smart contract interactions."',
      '"This credit profile becomes a portable on-chain reputation, reusable across the protocol."'
    ],
    action: 'Navigate to Credit Profile dashboard',
    keySignal: '"portable, on-chain, behavior-based"'
  },
  {
    id: 'lending-loop',
    title: 'Borrow → Repay → Reputation Loop',
    duration: '45 sec',
    icon: TrendingUp,
    navTo: '/dashboard/borrow',
    navLabel: 'Open Borrow Page',
    script: [
      '"When a user wants to borrow, access is influenced by their credit history, not just collateral size."',
      '"After borrowing, repayment is enforced on-chain."',
      '"Successful repayment increases reputation, which unlocks better access and better terms over time."',
      '"This creates a closed loop: build credit → borrow → repay → reputation improves."'
    ],
    action: 'Show lending flow diagram or Borrow page',
    keySignal: 'Pause for effect after "closed loop"'
  },
  {
    id: 'depin-funding',
    title: 'DePIN Funding Demo',
    duration: '45 sec',
    icon: Cpu,
    navTo: '/dashboard/depin-finance',
    navLabel: 'Open DePIN Finance',
    script: [
      '"We also introduce a DePIN funding module."',
      '"Users can fund real-world infrastructure like energy or compute using USD-denominated amounts, which reflects real infrastructure costs."',
      '"Ownership, contributions, and profit-sharing are recorded on-chain."',
      '"Instead of interest-based lending, contributors receive transparent yield and proof-of-impact NFTs."'
    ],
    action: 'Navigate to DePIN section, show funding flow',
    keySignal: '"This bridges decentralized capital with verifiable physical-world outcomes."'
  },
  {
    id: 'usd-denomination',
    title: 'Why USD Denomination',
    duration: '20 sec',
    icon: Globe,
    navTo: null,
    navLabel: null,
    script: [
      '"Although funding is denominated in USD or stable equivalents, all credit, ownership, and reputation remain on-chain, fully aligned with Creditcoin\'s credit architecture."',
      '"This ensures realistic economics without compromising on-chain transparency."'
    ],
    action: 'Stay on current page, emphasize point',
    keySignal: null
  },
  {
    id: 'creditcoin-alignment',
    title: 'Creditcoin Alignment',
    duration: '30 sec',
    icon: Shield,
    navTo: '/whitepaper',
    navLabel: 'Show Whitepaper',
    script: [
      '"MoonCreditFi acts as a credit-aware application layer for Creditcoin."',
      '"Credit history is transparent."',
      '"Reputation is reusable."',
      '"Capital supports real economic activity."',
      '"This is exactly the kind of application Creditcoin enables."'
    ],
    action: 'Scroll to Creditcoin alignment section or whitepaper',
    keySignal: null
  },
  {
    id: 'status',
    title: 'Current Status',
    duration: '20 sec',
    icon: CheckCircle2,
    navTo: null,
    navLabel: null,
    script: [
      '"This is not a concept."',
      '"We have deployed smart contracts, a working frontend, backend AI services, and a functional DePIN module running on testnet."'
    ],
    action: 'Pause, make eye contact with judges',
    keySignal: 'Emphasize: "not a concept"'
  },
  {
    id: 'closing',
    title: 'Closing',
    duration: '15 sec',
    icon: Home,
    navTo: '/',
    navLabel: 'Return to Home',
    script: [
      '"MoonCreditFi shows how decentralized credit can move beyond speculation into real financial infrastructure."',
      '"Thank you."'
    ],
    action: 'Return to homepage, show dashboard overview',
    keySignal: null
  }
];

const ProductDemo = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [activeTab, setActiveTab] = useState('script');

  const section = demoSections[currentSection];
  const Icon = section.icon;

  const goToSection = (index) => {
    if (index >= 0 && index < demoSections.length) {
      setCurrentSection(index);
    }
  };

  const handleNavigation = (path) => {
    if (path) {
      window.open(`/#${path}`, '_blank');
    }
  };

  const totalDuration = '3-4 minutes';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Exit Demo
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-primary" />
              <span className="font-semibold">MoonCreditFi Live Demo</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-8">
                <TabsTrigger value="script" className="text-xs gap-1 px-3">
                  <Mic className="h-3 w-3" />
                  Script
                </TabsTrigger>
                <TabsTrigger value="narrated" className="text-xs gap-1 px-3">
                  <Play className="h-3 w-3" />
                  AI Voice
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {totalDuration}
            </Badge>
            <Badge variant="secondary">
              {currentSection + 1} / {demoSections.length}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 pb-24">
        {activeTab === 'narrated' ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">AI-Narrated Demo</h2>
              <p className="text-muted-foreground">
                Professional voice narration of the MoonCreditFi presentation
              </p>
            </div>
            <NarratedDemoPlayer />
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Section Navigator - Left Sidebar */}
          <div className="lg:col-span-3">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">SECTIONS</h3>
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="space-y-1 pr-4">
                    {demoSections.map((s, idx) => {
                      const SectionIcon = s.icon;
                      const isActive = idx === currentSection;
                      const isPast = idx < currentSection;
                      
                      return (
                        <button
                          key={s.id}
                          onClick={() => goToSection(idx)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : isPast 
                                ? 'bg-muted/50 text-muted-foreground' 
                                : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <SectionIcon className={`h-4 w-4 ${isActive ? '' : isPast ? 'text-green-500' : ''}`} />
                            <span className="text-sm font-medium truncate">{s.title}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 opacity-60" />
                            <span className="text-xs opacity-60">{s.duration}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Teleprompter */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Section Header */}
                <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-2">{section.duration}</Badge>
                          <h1 className="text-2xl sm:text-3xl font-bold">{section.title}</h1>
                        </div>
                      </div>
                      {section.navTo && (
                        <Button 
                          onClick={() => handleNavigation(section.navTo)}
                          className="gap-2 w-full sm:w-auto"
                        >
                          {section.navLabel}
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Script Content */}
                <Card className="mb-6">
                  <CardContent className="p-6 sm:p-8">
                    <div className="space-y-6">
                      {section.script.map((line, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-4"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                            {idx + 1}
                          </div>
                          <p className="text-lg sm:text-xl leading-relaxed pt-1 text-foreground/90">
                            {line}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action & Signal Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card className="border-amber-500/30 bg-amber-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-amber-500" />
                        <span className="font-semibold text-sm text-amber-600 dark:text-amber-400">ACTION</span>
                      </div>
                      <p className="text-foreground/80">👉 {section.action}</p>
                    </CardContent>
                  </Card>

                  {section.keySignal && (
                    <Card className="border-green-500/30 bg-green-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-sm text-green-600 dark:text-green-400">KEY SIGNAL</span>
                        </div>
                        <p className="text-foreground/80 font-medium">{section.keySignal}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => goToSection(currentSection - 1)}
                    disabled={currentSection === 0}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>

                  <div className="flex items-center gap-1 sm:gap-2">
                    {demoSections.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToSection(idx)}
                        className={`h-2 rounded-full transition-all ${
                          idx === currentSection 
                            ? 'bg-primary w-6 sm:w-8' 
                            : idx < currentSection 
                              ? 'bg-green-500 w-2' 
                              : 'bg-muted-foreground/30 w-2'
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    size="lg"
                    onClick={() => goToSection(currentSection + 1)}
                    disabled={currentSection === demoSections.length - 1}
                    className="gap-2"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        )}
      </div>

      {/* Quick Nav Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border/50 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto pb-1">
            <span className="text-sm text-muted-foreground flex-shrink-0 hidden sm:inline">Quick Nav:</span>
            <Button variant="ghost" size="sm" onClick={() => handleNavigation('/')}>
              <Home className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Home</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleNavigation('/dashboard/credit')}>
              <User className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Credit</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleNavigation('/dashboard/borrow')}>
              <Landmark className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Borrow</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleNavigation('/dashboard/lend')}>
              <TrendingUp className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Lend</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleNavigation('/dashboard/depin-finance')}>
              <Cpu className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">DePIN</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleNavigation('/whitepaper')}>
              <Shield className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Whitepaper</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDemo;
