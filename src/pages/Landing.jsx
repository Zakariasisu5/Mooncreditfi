import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Shield, TrendingUp, Zap, Users, CheckCircle, Lock, Globe, Coins, Sun, Wifi, Car, FileText, Github, ExternalLink, Award, Target, Rocket, ChevronRight, Download, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-defi.jpg';

const Landing = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const trustSignals = [
    { icon: Award, text: 'Built for Creditcoin CEIP' },
    { icon: Users, text: 'On-chain reputation, not collateral-only lending' },
    { icon: FileText, text: 'Transparent smart contracts' }
  ];

  const platformStats = [
    { label: 'On-chain Credit Profiles', status: 'Testnet Live', icon: Users },
    { label: 'DeFi Lending Pools', status: 'Smart Contracts Deployed', icon: Coins },
    { label: 'DePIN Infrastructure Funding', status: 'Credit Flow Verified On-chain', icon: Sun },
    { label: 'Credit Reputation Growth', status: 'Active & Auditable', icon: TrendingUp }
  ];

  const howItWorksSteps = [
    { step: 1, title: 'Create On-chain Credit Profile', description: 'Register your wallet and start building verifiable credit history', icon: Users },
    { step: 2, title: 'Borrow Based on Reputation', description: 'Access loans based on your credit score, not just collateral', icon: Coins },
    { step: 3, title: 'Repay & Improve Score', description: 'Every successful repayment increases your credit score', icon: TrendingUp },
    { step: 4, title: 'Unlock Better Rates & DePIN Access', description: 'Higher scores unlock lower rates and DePIN funding opportunities', icon: Zap }
  ];

  const creditFlowSteps = [
    { label: 'Credit Score', color: 'bg-blue-500' },
    { label: 'Borrow', color: 'bg-purple-500' },
    { label: 'Repay', color: 'bg-green-500' },
    { label: 'Reputation', color: 'bg-orange-500' },
    { label: 'Better Access', color: 'bg-primary' }
  ];

  const whyCreditcoinPoints = [
    { icon: Shield, title: 'On-chain Credit History', description: 'Creditcoin records credit history directly on the blockchain, creating immutable, verifiable records.' },
    { icon: TrendingUp, title: 'Reputation-Powered DeFi', description: 'MoonCreditFi uses this model to power lending — your repayment history IS your collateral.' },
    { icon: CheckCircle, title: 'Real Data → Real Trust', description: 'Real repayment data creates real reputation, enabling real trust between lenders and borrowers.' },
    { icon: Globe, title: 'Financial Inclusion Mission', description: 'Perfectly aligned with Creditcoin\'s mission to bring financial inclusion to the underbanked.' }
  ];

  const depinFeatures = [
    { icon: Sun, title: 'Solar Infrastructure', description: 'Fund solar panel installations and earn from energy production' },
    { icon: Wifi, title: 'Connectivity Networks', description: 'Support WiFi and telecom infrastructure deployment' },
    { icon: Car, title: 'Mobility & Compute', description: 'Finance EV charging stations and compute nodes' }
  ];

  const securityFeatures = [
    { icon: Github, title: 'Open-source Smart Contracts', description: 'All contract code is publicly auditable on GitHub' },
    { icon: Lock, title: 'On-chain Credit Records', description: 'Credit history stored immutably on blockchain' },
    { icon: FileText, title: 'No Hidden Scoring Logic', description: 'Transparent algorithms determine credit scores' },
    { icon: CheckCircle, title: 'Auditable Transactions', description: 'Every transaction is verifiable on-chain' }
  ];

  const roadmapPhases = [
    { phase: 1, title: 'Credit Profiles & Lending', status: 'Done', description: 'Smart contracts for credit scoring and lending pools' },
    { phase: 2, title: 'DePIN Funding Module', status: 'Done', description: 'Infrastructure funding with real-yield returns' },
    { phase: 3, title: 'Full Creditcoin Testnet Deployment', status: 'Done', description: 'Complete integration with Creditcoin testnet' },
    { phase: 4, title: 'Mainnet + Partnerships', status: 'Next', description: 'Production launch and strategic partnerships' }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-xl fixed w-full z-50 bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="MoonCreditFi logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-md object-cover" onError={(e) => { e.currentTarget.src = '/moonfi-logo.svg'; }} />
            <span className="font-bold text-sm sm:text-base">MoonCreditFi</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm" 
              className="btn-mooncreditfi text-xs sm:text-sm px-3 sm:px-4"
              onClick={() => navigate('/dashboard')}
            >
              Launch App
              <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-24 pb-8 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Hero background"
            className="w-full h-full object-cover opacity-100"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto text-center max-w-5xl relative z-10"
        >
          {/* CEIP Badge */}
          <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
            <Badge className="bg-primary/20 text-primary border-primary/40 text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Built for Creditcoin CEIP
            </Badge>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-4 sm:mb-6 leading-tight tracking-tight"
          >
            <span className="mooncreditfi-glow">On-Chain Credit</span>
            <br />
            <span className="text-white">For Real-World Impact</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 font-medium mb-6 sm:mb-8 max-w-3xl mx-auto px-4"
          >
            Reputation-based DeFi lending and decentralized infrastructure funding. 
            Build credit. Fund the real world. All verified on-chain.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 mb-8 sm:mb-12"
          >
            <Button 
              size="lg" 
              className="btn-mooncreditfi text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 w-full sm:w-auto" 
              onClick={() => navigate('/dashboard')}
            >
              Launch App
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 w-full sm:w-auto border-white/30 text-white hover:bg-white/10" 
              onClick={() => navigate('/demo')}
            >
              <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Trust Signals */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-2 sm:gap-4 px-4"
          >
            {trustSignals.map((signal, i) => (
              <div key={i} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <signal.icon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="text-[10px] sm:text-xs text-white font-medium">{signal.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section - Credible & Honest */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Platform <span className="mooncreditfi-glow">Status</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Transparent progress on our mission to democratize credit
            </p>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {platformStats.map((stat, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="card-glow h-full">
                  <CardContent className="pt-5 sm:pt-6 pb-5 sm:pb-6 text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base mb-2">{stat.label}</h3>
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {stat.status}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              How It <span className="mooncreditfi-glow">Works</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              A simple four-step process to build credit and access DeFi
            </p>
          </motion.div>

          {/* Steps */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12"
          >
            {howItWorksSteps.map((step, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="card-glow h-full relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm sm:text-base">
                    {step.step}
                  </div>
                  <CardContent className="pt-8 sm:pt-10 pb-5 sm:pb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-base mb-2">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Credit Flow Diagram */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl border border-border p-4 sm:p-8"
          >
            <h3 className="text-center text-lg sm:text-xl font-bold mb-6 sm:mb-8">Credit Reputation Cycle</h3>
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
              {creditFlowSteps.map((flowStep, index) => (
                <div key={index} className="flex items-center">
                  <div className={`px-3 sm:px-5 py-2 sm:py-3 rounded-lg ${flowStep.color} text-white font-semibold text-xs sm:text-sm`}>
                    {flowStep.label}
                  </div>
                  {index < creditFlowSteps.length - 1 && (
                    <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-muted-foreground mx-1" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Creditcoin Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <Badge className="mb-3 sm:mb-4 bg-primary/20 text-primary border-primary/40">
              <Coins className="w-3 h-3 mr-1" />
              Creditcoin Native
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Why <span className="mooncreditfi-glow">Creditcoin?</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Creditcoin is purpose-built for credit — MoonCreditFi extends this vision to DeFi lending and real-world infrastructure funding.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto"
          >
            {whyCreditcoinPoints.map((point, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="card-glow h-full">
                  <CardContent className="pt-5 sm:pt-6 pb-5 sm:pb-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 rounded-lg bg-primary/10 flex-shrink-0">
                        <point.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">{point.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{point.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 sm:mt-12 text-center"
          >
            <Card className="card-glow max-w-3xl mx-auto bg-primary/5 border-primary/20">
              <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8">
                <p className="text-sm sm:text-base md:text-lg font-medium text-foreground">
                  "Real repayment data → Real reputation → Real trust"
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  This is the foundation of financial inclusion that Creditcoin enables.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* DePIN Funding Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <Badge className="mb-3 sm:mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
              <Sun className="w-3 h-3 mr-1" />
              Real-World Impact
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              DePIN <span className="mooncreditfi-glow">Funding</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Fund real-world infrastructure and earn real-world yields — not speculation.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
          >
            {depinFeatures.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="card-glow h-full group hover:scale-[1.02] transition-transform">
                  <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8 text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 p-3 sm:p-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <feature.icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-base mb-2">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto"
          >
            {[
              { label: 'Transparent Funding', icon: FileText },
              { label: 'On-chain Tracking', icon: Lock },
              { label: 'Real-world Yield', icon: TrendingUp },
              { label: 'Verifiable Impact', icon: CheckCircle }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-card border border-border">
                <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary mb-2" />
                <span className="text-xs sm:text-sm text-center font-medium">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Security & Transparency Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <Badge className="mb-3 sm:mb-4 bg-green-500/10 text-green-400 border-green-500/30">
              <Shield className="w-3 h-3 mr-1" />
              Security First
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Security & <span className="mooncreditfi-glow">Transparency</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Built on trust, verified by code
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {securityFeatures.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="card-glow h-full">
                  <CardContent className="pt-5 sm:pt-6 pb-5 sm:pb-6 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base mb-1">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <Badge className="mb-3 sm:mb-4 bg-purple-500/10 text-purple-400 border-purple-500/30">
              <Rocket className="w-3 h-3 mr-1" />
              Development Progress
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Project <span className="mooncreditfi-glow">Roadmap</span>
            </h2>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-3 sm:space-y-4"
          >
            {roadmapPhases.map((phase, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className={`card-glow ${phase.status === 'Next' ? 'border-primary/50 bg-primary/5' : ''}`}>
                  <CardContent className="py-4 sm:py-5 px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                          phase.status === 'Done' ? 'bg-green-500 text-white' :
                          phase.status === 'Next' ? 'bg-primary text-primary-foreground' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {phase.status === 'Done' ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : phase.phase}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-sm sm:text-base">{phase.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">{phase.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-xs self-start sm:self-center ${
                        phase.status === 'Done' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                        phase.status === 'Next' ? 'bg-primary/10 text-primary border-primary/30' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {phase.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10"></div>
            <div className="relative p-8 sm:p-12 md:p-16 text-center">
              <Coins className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                Build Credit. Fund the Real World.
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl font-medium mb-6 sm:mb-8 max-w-2xl mx-auto mooncreditfi-glow">
                Powered by Creditcoin
              </p>
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="btn-mooncreditfi text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14"
                  onClick={() => navigate('/dashboard')}
                >
                  Launch App
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 sm:py-12 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <img src="/logo.png" alt="MoonCreditFi logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-md object-cover" onError={(e) => { e.currentTarget.src = '/moonfi-logo.svg'; }} />
                <span className="font-bold">MoonCreditFi</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                On-chain credit for financial inclusion
              </p>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Resources</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><a href="#/demo" className="hover:text-primary transition-colors flex items-center gap-1"><Play className="w-3 h-3" /> Product Demo</a></li>
                <li><a href="#/whitepaper" className="hover:text-primary transition-colors flex items-center gap-1"><Download className="w-3 h-3" /> Whitepaper (PDF)</a></li>
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1"><Github className="w-3 h-3" /> GitHub</a></li>
                <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Smart Contracts</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><a href="#/terms" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#/privacy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#/about" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#/contact" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Status */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Status</h4>
              <div className="space-y-2">
                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  CEIP Application Ready
                </Badge>
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30 block w-fit">
                  <Target className="w-3 h-3 mr-1" />
                  Testnet Live
                </Badge>
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2026 MoonCreditFi. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Built on Creditcoin
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
