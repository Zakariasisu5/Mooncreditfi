import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
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
              <Lock className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Privacy <span className="mooncreditfi-glow">Policy</span>
            </h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
          </div>

          <Card className="card-glow">
            <CardContent className="p-6 sm:p-8 space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-3">1. Introduction</h2>
                <p className="text-muted-foreground">
                  MoonCreditFi ("we," "our," or "us") is committed to protecting your privacy. This Privacy 
                  Policy explains how we collect, use, and safeguard your information when you use our 
                  decentralized finance platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">2. Information We Collect</h2>
                <p className="text-muted-foreground mb-3">
                  As a decentralized platform, we collect minimal personal information:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>Wallet Address:</strong> Your public blockchain address when you connect your wallet</li>
                  <li><strong>Transaction Data:</strong> On-chain transaction history (publicly available on the blockchain)</li>
                  <li><strong>Usage Data:</strong> Anonymous analytics about how you interact with our platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">3. Blockchain Transparency</h2>
                <p className="text-muted-foreground">
                  Please note that blockchain transactions are inherently public and transparent. Your wallet 
                  address and transaction history on the Creditcoin blockchain can be viewed by anyone. We do 
                  not control or have the ability to hide this information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">4. How We Use Your Information</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>To provide and maintain our DeFi services</li>
                  <li>To calculate your on-chain credit score</li>
                  <li>To process lending and borrowing transactions</li>
                  <li>To improve our platform and user experience</li>
                  <li>To detect and prevent fraud or abuse</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">5. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement industry-standard security measures to protect your data. However, no method 
                  of transmission over the Internet or electronic storage is 100% secure. We strive to use 
                  commercially acceptable means to protect your information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">6. Third-Party Services</h2>
                <p className="text-muted-foreground">
                  Our platform may integrate with third-party services such as wallet providers (RainbowKit, 
                  WalletConnect) and blockchain networks. These services have their own privacy policies, 
                  and we encourage you to review them.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">7. Cookies and Tracking</h2>
                <p className="text-muted-foreground">
                  We may use cookies and similar tracking technologies to improve your experience. You can 
                  control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">8. Your Rights</h2>
                <p className="text-muted-foreground">
                  Depending on your jurisdiction, you may have rights regarding your personal data, including 
                  the right to access, correct, or delete your information. Contact us to exercise these rights.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">9. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by 
                  posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">10. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us through the Contact page.
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

export default Privacy;
