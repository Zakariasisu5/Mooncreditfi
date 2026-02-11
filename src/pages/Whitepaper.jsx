import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Shield, Coins, Users, TrendingUp, CheckCircle, Globe, Zap, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Whitepaper = () => {
  const navigate = useNavigate();

  const handleDownload = () => {
    toast.info('Preparing PDF download...');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Hidden in print */}
      <nav className="border-b border-border/40 backdrop-blur-xl sticky top-0 z-50 bg-background/80 print:hidden">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleDownload} className="btn-mooncreditfi gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </nav>

      {/* Whitepaper Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl print:max-w-none print:px-8">
        {/* Cover Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 print:mb-12"
        >
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="MoonCreditFi" 
              className="w-24 h-24 rounded-2xl object-cover print:w-20 print:h-20"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 print:text-4xl">
            <span className="mooncreditfi-glow print:text-primary">MoonCreditFi</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-2">
            Decentralized Credit & DePIN Financing Protocol
          </p>
          <p className="text-lg text-primary font-semibold">Built on Creditcoin</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span>Version 1.0</span>
            <span>•</span>
            <span>February 2026</span>
            <span>•</span>
            <span>CEIP Application</span>
          </div>
        </motion.div>

        {/* Executive Summary */}
        <Section title="Executive Summary" icon={Shield}>
          <p className="text-muted-foreground leading-relaxed mb-4">
            MoonCreditFi is a next-generation decentralized finance (DeFi) protocol built on the Creditcoin blockchain, 
            designed to revolutionize credit-based lending and real-world infrastructure financing. Our platform combines 
            on-chain credit profiles, reputation-based lending pools, and Decentralized Physical Infrastructure Network 
            (DePIN) funding mechanisms to create a transparent, inclusive financial ecosystem.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            By leveraging Creditcoin's credit-tracking infrastructure, MoonCreditFi enables users to build verifiable 
            credit histories on-chain, access under-collateralized loans based on reputation, and participate in funding 
            real-world infrastructure projects with transparent yield distribution.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <StatBox label="Credit Profiles" value="On-Chain" />
            <StatBox label="Lending Model" value="Reputation" />
            <StatBox label="DePIN Projects" value="Real Yield" />
            <StatBox label="Network" value="Creditcoin" />
          </div>
        </Section>

        {/* Problem Statement */}
        <Section title="Problem Statement" icon={TrendingUp}>
          <div className="space-y-6">
            <ProblemCard
              title="Credit Invisibility"
              description="Over 1.7 billion adults globally lack access to formal financial services. Traditional credit systems are opaque, centralized, and exclude billions from economic participation."
            />
            <ProblemCard
              title="Over-Collateralization in DeFi"
              description="Current DeFi lending requires 150-200% collateralization, making it inaccessible for most users and inefficient for capital deployment."
            />
            <ProblemCard
              title="Infrastructure Funding Gap"
              description="Real-world infrastructure projects (solar, compute, connectivity) face a $15 trillion funding gap. Traditional financing excludes retail investors from these opportunities."
            />
            <ProblemCard
              title="Lack of Transparency"
              description="Traditional lending institutions operate as black boxes, with hidden fees, opaque interest calculations, and no accountability for lending decisions."
            />
          </div>
        </Section>

        {/* Solution */}
        <Section title="The MoonCreditFi Solution" icon={Zap}>
          <p className="text-muted-foreground leading-relaxed mb-8">
            MoonCreditFi addresses these challenges through three interconnected smart contract modules that work 
            together to create a comprehensive credit and financing ecosystem.
          </p>
          
          <div className="space-y-6">
            <SolutionCard
              number="01"
              title="Credit Profile System"
              features={[
                "Wallet-based credit score tracking (300-850 range)",
                "Immutable loan history recorded on-chain",
                "Reputation growth through successful repayments",
                "Cross-platform credit portability"
              ]}
            />
            <SolutionCard
              number="02"
              title="Reputation-Based Lending Pool"
              features={[
                "Deposit tokens to earn competitive yields",
                "Borrow based on credit score, not just collateral",
                "Dynamic interest rates tied to reputation",
                "Transparent, auditable lending logic"
              ]}
            />
            <SolutionCard
              number="03"
              title="DePIN Funding Module"
              features={[
                "Fund real-world infrastructure projects",
                "Ownership shares proportional to contribution",
                "Real yield distribution (profit-sharing)",
                "Proof-of-impact NFTs for contributors"
              ]}
            />
          </div>
        </Section>

        {/* Architecture Diagram */}
        <Section title="System Architecture" icon={Globe}>
          <div className="bg-muted/30 rounded-2xl p-6 sm:p-8 border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <ArchBlock
                title="Frontend Layer"
                items={["React + Vite", "RainbowKit Wallet", "Real-time Updates", "Mobile Responsive"]}
              />
              <ArchBlock
                title="Smart Contracts"
                items={["CreditProfile.sol", "LendingPool.sol", "DePINFunding.sol", "Upgradeable Proxies"]}
              />
              <ArchBlock
                title="Infrastructure"
                items={["Creditcoin Network", "IPFS Storage", "Supabase Backend", "CoinGecko Oracle"]}
              />
            </div>
            
            {/* Flow Diagram */}
            <div className="mt-8 pt-8 border-t border-border">
              <h4 className="font-semibold mb-6 text-center">Credit Reputation Cycle</h4>
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 text-sm">
                <FlowStep step="1" label="Connect Wallet" />
                <FlowArrow />
                <FlowStep step="2" label="Deposit/Borrow" />
                <FlowArrow />
                <FlowStep step="3" label="Repay Loans" />
                <FlowArrow />
                <FlowStep step="4" label="Build Credit" />
                <FlowArrow />
                <FlowStep step="5" label="Better Rates" />
              </div>
            </div>
          </div>
        </Section>

        {/* Smart Contracts */}
        <Section title="Smart Contract Specifications" icon={Lock}>
          <div className="space-y-6">
            <ContractSpec
              name="CreditProfile.sol"
              address="0x32228b52A411528F521412B4cEb1F0D21e84bDed"
              description="Manages wallet-based credit scores and loan history. Scores range from 300-850, with reputation updates triggered by loan repayments and DePIN funding activities."
              functions={["getScore()", "updateScoreOnRepayment()", "recordLoan()", "getLoanHistory()"]}
            />
            <ContractSpec
              name="LendingPool.sol"
              address="0x6AFa3a9BDc76e7e2a88104cf24420e7Bc9F07728"
              description="Core lending protocol enabling deposits, credit-based borrowing, and yield distribution. Interest rates are dynamically adjusted based on pool utilization and borrower credit scores."
              functions={["deposit()", "borrow()", "repay()", "withdraw()", "getPoolStats()"]}
            />
            <ContractSpec
              name="DePINFunding.sol"
              address="0x9F69c698b20e7d7F16FD6a25F2f57E29c8b8bE2D"
              description="Enables crowdfunding of real-world infrastructure projects. Tracks contributions, distributes yields proportionally, and mints proof-of-impact NFTs for participants."
              functions={["fundProject()", "claimYield()", "getProjectDetails()", "mintImpactNFT()"]}
            />
          </div>
        </Section>

        {/* Credit Score Model */}
        <Section title="Credit Score Model" icon={TrendingUp}>
          <p className="text-muted-foreground leading-relaxed mb-6">
            The MoonCreditFi credit score model is designed to be fair, transparent, and incentivize positive financial behavior.
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Score Range</th>
                  <th className="text-left py-3 px-4">Rating</th>
                  <th className="text-left py-3 px-4">Max Borrow</th>
                  <th className="text-left py-3 px-4">Interest Rate</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">750-850</td>
                  <td className="py-3 px-4 text-green-500">Excellent</td>
                  <td className="py-3 px-4">100 CTC</td>
                  <td className="py-3 px-4">3-5%</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">650-749</td>
                  <td className="py-3 px-4 text-blue-500">Good</td>
                  <td className="py-3 px-4">50 CTC</td>
                  <td className="py-3 px-4">5-8%</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">550-649</td>
                  <td className="py-3 px-4 text-yellow-500">Fair</td>
                  <td className="py-3 px-4">25 CTC</td>
                  <td className="py-3 px-4">8-12%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">300-549</td>
                  <td className="py-3 px-4 text-red-500">Building</td>
                  <td className="py-3 px-4">10 CTC</td>
                  <td className="py-3 px-4">12-15%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-green-500/10 border-green-500/20">
              <CardContent className="p-4">
                <h4 className="font-semibold text-green-500 mb-2">Score Increases</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• On-time loan repayment: +10-25 points</li>
                  <li>• DePIN project funding: +5-15 points</li>
                  <li>• Consistent deposit history: +5-10 points</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/20">
              <CardContent className="p-4">
                <h4 className="font-semibold text-red-500 mb-2">Score Decreases</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Late repayment (7+ days): -15-30 points</li>
                  <li>• Loan default: -50-100 points</li>
                  <li>• Liquidation event: -30-50 points</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* DePIN Overview */}
        <Section title="DePIN Funding Model" icon={Coins}>
          <p className="text-muted-foreground leading-relaxed mb-6">
            MoonCreditFi's DePIN module enables retail investors to participate in funding real-world infrastructure 
            projects, democratizing access to stable, yield-generating assets.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <DePINProject
              name="Solar Grid Ghana"
              category="Renewable Energy"
              target="50,000 CTC"
              apy="8-12%"
              impact="500+ homes powered"
            />
            <DePINProject
              name="Edge Compute Lagos"
              category="Computing Infrastructure"
              target="30,000 CTC"
              apy="10-15%"
              impact="Reduced latency by 60%"
            />
          </div>

          <div className="bg-muted/30 rounded-xl p-6 border border-border">
            <h4 className="font-semibold mb-4">Yield Distribution Model</h4>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-2xl font-bold text-primary">70%</div>
                <div className="text-muted-foreground">To Funders</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">20%</div>
                <div className="text-muted-foreground">Operations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">10%</div>
                <div className="text-muted-foreground">Reserve Fund</div>
              </div>
            </div>
          </div>
        </Section>

        {/* Roadmap */}
        <Section title="Development Roadmap" icon={CheckCircle}>
          <div className="space-y-6">
            <RoadmapPhase
              phase="Phase 1"
              title="Foundation"
              status="completed"
              items={[
                "Credit Profile smart contract deployment",
                "Basic lending pool implementation",
                "Frontend MVP development",
                "Creditcoin testnet integration"
              ]}
            />
            <RoadmapPhase
              phase="Phase 2"
              title="DePIN Integration"
              status="completed"
              items={[
                "DePIN funding smart contract",
                "Project listing and management UI",
                "Yield distribution mechanism",
                "Impact tracking dashboard"
              ]}
            />
            <RoadmapPhase
              phase="Phase 3"
              title="Testnet Launch"
              status="completed"
              items={[
                "Full testnet deployment",
                "Security audits initiated",
                "Community beta testing",
                "Documentation and guides"
              ]}
            />
            <RoadmapPhase
              phase="Phase 4"
              title="Mainnet & Growth"
              status="upcoming"
              items={[
                "Creditcoin mainnet deployment",
                "Strategic partnerships",
                "Multi-chain expansion",
                "Institutional DePIN projects"
              ]}
            />
          </div>
        </Section>

        {/* AI Credit Risk Engine */}
        <Section title="AI Credit Risk Engine" icon={Zap}>
          <p className="text-muted-foreground leading-relaxed mb-6">
            At the heart of MoonCreditFi is our AI-powered Credit Risk Engine, which provides transparent, explainable 
            credit assessments by analyzing on-chain behavior using machine learning—not static rules.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="card-glow">
              <CardContent className="p-6">
                <h4 className="font-semibold text-lg mb-4 text-primary">How It Works</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    Analyzes wallet transaction patterns and frequency
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    Evaluates DeFi interaction history
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    Tracks loan repayment behavior over time
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    Detects risk flags (inactivity, large withdrawals)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    Generates explainable reasoning for all decisions
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardContent className="p-6">
                <h4 className="font-semibold text-lg mb-4 text-primary">Output Profile</h4>
                <div className="space-y-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Credit Score</span>
                      <span className="text-primary font-bold">0–100</span>
                    </div>
                    <p className="text-xs text-muted-foreground">AI-computed behavioral score</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Risk Level</span>
                      <span className="text-yellow-500 font-bold">Low / Medium / High</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Classification for lending decisions</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Loan Recommendation</span>
                      <span className="text-green-500 font-bold">$50 – $5,000</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Microloan-focused amounts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-primary/10 rounded-xl p-6 border border-primary/20">
            <h4 className="font-semibold mb-4">AI Reasoning Example</h4>
            <div className="bg-background/50 rounded-lg p-4 font-mono text-xs">
              <pre className="whitespace-pre-wrap text-muted-foreground">
{`{
  "credit_score": 72,
  "risk_level": "Medium",
  "loan_eligibility": "Eligible",
  "recommended_loan_amount_usd": 500,
  "ai_reasoning_summary": [
    "Wallet has 8 months of consistent activity",
    "3 successful loan repayments recorded",
    "Active DeFi participation (positive signal)",
    "No risk flags detected"
  ]
}`}
              </pre>
            </div>
          </div>
        </Section>

        {/* Security */}
        <Section title="Security & Audits" icon={Shield}>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Security is paramount at MoonCreditFi. Our smart contracts follow industry best practices and are designed 
            with multiple layers of protection.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SecurityItem title="Access Control" description="Role-based permissions using OpenZeppelin standards" />
            <SecurityItem title="Reentrancy Guards" description="All external calls protected against reentrancy attacks" />
            <SecurityItem title="Pausable Contracts" description="Emergency pause functionality for critical situations" />
            <SecurityItem title="Upgradeable Proxies" description="UUPS proxy pattern for secure contract upgrades" />
            <SecurityItem title="Rate Limiting" description="Built-in rate limits to prevent manipulation" />
            <SecurityItem title="Oracle Security" description="Multiple price feed sources with fallback mechanisms" />
            <SecurityItem title="AI Model Security" description="Sandboxed AI inference with rate limiting and validation" />
            <SecurityItem title="Data Privacy" description="On-chain analysis only—no personal data collection" />
          </div>
        </Section>

        {/* Team */}
        <Section title="Team & Advisors" icon={Users}>
          <p className="text-muted-foreground leading-relaxed mb-6">
            MoonCreditFi is built by a team of experienced blockchain developers, DeFi experts, and financial 
            inclusion advocates committed to democratizing access to credit and infrastructure investment.
          </p>

          <div className="bg-muted/30 rounded-xl p-6 border border-border text-center">
            <p className="text-muted-foreground">
              Team information available upon request. Contact us at{' '}
              <a href="mailto:zakariasisu5@gmail.com" className="text-primary hover:underline">
                zakariasisu5@gmail.com
              </a>
            </p>
          </div>
        </Section>

        {/* Conclusion */}
        <Section title="Conclusion" icon={Globe}>
          <p className="text-muted-foreground leading-relaxed mb-4">
            MoonCreditFi represents a paradigm shift in decentralized finance—moving beyond pure speculation 
            toward building real economic value. By combining Creditcoin's credit-tracking infrastructure with 
            innovative lending mechanisms and DePIN funding, we're creating a platform that serves the underserved 
            while generating sustainable returns for all participants.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our mission is clear: democratize access to credit and infrastructure investment, one wallet at a time. 
            We invite investors, partners, and users to join us in building a more inclusive financial future.
          </p>
          
          <div className="mt-8 p-6 bg-primary/10 rounded-xl border border-primary/20 text-center">
            <h4 className="font-bold text-lg mb-2">Ready to Get Started?</h4>
            <p className="text-muted-foreground mb-4">Connect your wallet and start building your on-chain credit profile today.</p>
            <Button onClick={() => navigate('/dashboard')} className="btn-mooncreditfi print:hidden">
              Launch App
            </Button>
          </div>
        </Section>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2026 MoonCreditFi. All rights reserved.</p>
          <p className="mt-2">Built for Creditcoin Ecosystem Incentive Program (CEIP)</p>
          <p className="mt-2">
            Contact: <a href="mailto:zakariasisu5@gmail.com" className="text-primary hover:underline">zakariasisu5@gmail.com</a>
          </p>
        </div>
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .mooncreditfi-glow { color: hsl(var(--primary)) !important; text-shadow: none !important; }
          .card-glow { box-shadow: none !important; }
          @page { margin: 1cm; }
        }
      `}</style>
    </div>
  );
};

// Helper Components
const Section = ({ title, icon: Icon, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-16 print:mb-10 print:break-inside-avoid"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
    </div>
    {children}
  </motion.section>
);

const StatBox = ({ label, value }) => (
  <div className="bg-muted/50 rounded-xl p-4 text-center">
    <div className="text-lg font-bold text-primary">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

const ProblemCard = ({ title, description }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-1 bg-destructive/50 rounded-full" />
    <div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

const SolutionCard = ({ number, title, features }) => (
  <Card className="card-glow">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <span className="font-bold text-primary">{number}</span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-lg mb-3">{title}</h4>
          <ul className="space-y-2">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ArchBlock = ({ title, items }) => (
  <div className="p-4 bg-background rounded-xl border border-border">
    <h4 className="font-semibold mb-3 text-primary">{title}</h4>
    <ul className="space-y-1 text-sm text-muted-foreground">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  </div>
);

const FlowStep = ({ step, label }) => (
  <div className="bg-primary/10 px-3 py-2 rounded-lg text-center min-w-[80px]">
    <div className="text-xs text-primary font-semibold">Step {step}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

const FlowArrow = () => (
  <div className="text-primary hidden sm:block">→</div>
);

const ContractSpec = ({ name, address, description, functions }) => (
  <Card className="card-glow print:break-inside-avoid">
    <CardContent className="p-6">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <h4 className="font-semibold text-lg">{name}</h4>
        <code className="text-xs bg-muted px-2 py-1 rounded break-all">{address}</code>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {functions.map((fn, i) => (
          <code key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{fn}</code>
        ))}
      </div>
    </CardContent>
  </Card>
);

const DePINProject = ({ name, category, target, apy, impact }) => (
  <Card className="card-glow">
    <CardContent className="p-4">
      <h4 className="font-semibold mb-1">{name}</h4>
      <p className="text-xs text-primary mb-3">{category}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Target:</span>
          <span className="ml-1 font-medium">{target}</span>
        </div>
        <div>
          <span className="text-muted-foreground">APY:</span>
          <span className="ml-1 font-medium text-green-500">{apy}</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Impact: {impact}
      </div>
    </CardContent>
  </Card>
);

const RoadmapPhase = ({ phase, title, status, items }) => (
  <div className={`flex gap-4 ${status === 'completed' ? 'opacity-100' : 'opacity-70'}`}>
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        status === 'completed' ? 'bg-green-500' : 'bg-primary/20'
      }`}>
        {status === 'completed' ? (
          <CheckCircle className="h-5 w-5 text-white" />
        ) : (
          <div className="w-3 h-3 rounded-full bg-primary" />
        )}
      </div>
      <div className="flex-1 w-px bg-border mt-2" />
    </div>
    <div className="flex-1 pb-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-primary">{phase}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'
        }`}>
          {status === 'completed' ? 'Done' : 'Next'}
        </span>
      </div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const SecurityItem = ({ title, description }) => (
  <div className="p-4 bg-muted/30 rounded-xl border border-border">
    <h4 className="font-semibold text-sm mb-1">{title}</h4>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);

export default Whitepaper;
