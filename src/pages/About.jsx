import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, TrendingUp, Zap, Users, Globe, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  const teamValues = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'We prioritize the safety of user funds and data above all else.',
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'Constantly pushing boundaries to bring cutting-edge DeFi solutions.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Our users shape the future of MoonCreditFi through governance.',
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'Making decentralized finance accessible to everyone, everywhere.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-xl sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap justify-between items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center space-x-2" aria-label="MoonCreditFi">
            <img src="/logo.png" alt="MoonCreditFi logo" className="w-6 h-6 sm:w-8 sm:h-8 rounded-md object-cover" onError={(e) => { e.currentTarget.src = '/moonfi-logo.svg'; }} />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              About <span className="mooncreditfi-glow">MoonCreditFi</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Building the future of decentralized credit and lending on the blockchain.
            </p>
          </div>

          <Card className="card-glow mb-12">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Coins className="h-6 w-6 text-primary" />
                Our Mission
              </h2>
              <p className="text-muted-foreground mb-4">
                MoonCreditFi is a decentralized finance platform built on the Creditcoin blockchain, 
                designed to revolutionize how credit works in the Web3 ecosystem. We believe that 
                everyone deserves access to fair, transparent, and efficient financial services.
              </p>
              <p className="text-muted-foreground mb-4">
                Our platform combines on-chain credit profiles, competitive lending rates, and 
                DePIN (Decentralized Physical Infrastructure Networks) financing to create a 
                comprehensive DeFi ecosystem that bridges the gap between traditional finance 
                and blockchain technology.
              </p>
              <p className="text-muted-foreground">
                By leveraging smart contracts and blockchain transparency, we eliminate intermediaries, 
                reduce costs, and provide users with full control over their financial data and assets.
              </p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            {teamValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="card-glow h-full">
                  <CardContent className="p-6">
                    <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="card-glow">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                Why Creditcoin?
              </h2>
              <p className="text-muted-foreground mb-4">
                We chose to build on Creditcoin because of its unique focus on credit and lending. 
                Creditcoin's blockchain is specifically designed to record credit transactions, 
                making it the perfect foundation for our decentralized credit platform.
              </p>
              <p className="text-muted-foreground">
                The Creditcoin network provides the security, scalability, and specialized infrastructure 
                needed to support our vision of democratized access to credit services.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© 2026 MoonCreditFi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
