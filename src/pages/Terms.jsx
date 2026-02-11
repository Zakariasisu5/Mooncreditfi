import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

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
            <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto mb-4">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Terms of <span className="mooncreditfi-glow">Service</span>
            </h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
          </div>

          <Card className="card-glow">
            <CardContent className="p-6 sm:p-8 space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing or using MoonCreditFi, you agree to be bound by these Terms of Service and all 
                  applicable laws and regulations. If you do not agree with any of these terms, you are 
                  prohibited from using or accessing this platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">2. Description of Service</h2>
                <p className="text-muted-foreground">
                  MoonCreditFi is a decentralized finance platform that provides lending, borrowing, and 
                  credit profile services on the Creditcoin blockchain. Our services include but are not 
                  limited to: cryptocurrency lending and borrowing, on-chain credit scoring, and DePIN 
                  infrastructure financing.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">3. Eligibility</h2>
                <p className="text-muted-foreground">
                  You must be at least 18 years old and have the legal capacity to enter into these Terms. 
                  By using our platform, you represent that you meet these requirements and that your use 
                  of MoonCreditFi complies with all applicable laws in your jurisdiction.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">4. Wallet Connection</h2>
                <p className="text-muted-foreground">
                  To use MoonCreditFi, you must connect a compatible cryptocurrency wallet. You are solely 
                  responsible for maintaining the security of your wallet and private keys. We do not have 
                  access to or control over your wallet.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">5. Risk Disclosure</h2>
                <p className="text-muted-foreground">
                  DeFi protocols involve significant risks including but not limited to: smart contract 
                  vulnerabilities, market volatility, impermanent loss, and regulatory changes. You 
                  acknowledge that you understand these risks and accept full responsibility for any 
                  losses that may occur.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">6. No Financial Advice</h2>
                <p className="text-muted-foreground">
                  Nothing on MoonCreditFi constitutes financial, investment, legal, or tax advice. All 
                  information is provided for educational purposes only. You should consult with qualified 
                  professionals before making any financial decisions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">7. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  MoonCreditFi and its operators shall not be liable for any direct, indirect, incidental, 
                  special, consequential, or punitive damages resulting from your use of the platform or 
                  inability to use the platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">8. Modifications</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these Terms at any time. Changes will be effective immediately 
                  upon posting. Your continued use of MoonCreditFi after any changes indicates your acceptance 
                  of the modified Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">9. Contact</h2>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms, please contact us through our official channels 
                  or visit the Contact page.
                </p>
              </section>
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

export default Terms;
