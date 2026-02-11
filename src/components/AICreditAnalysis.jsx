import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Sparkles,
  DollarSign,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AICreditAnalysis = ({ walletData, onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const runAnalysis = async () => {
    if (!walletData?.walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-credit-analysis', {
        body: { walletData }
      });

      if (error) throw error;
      
      if (data?.analysis) {
        setAnalysis(data.analysis);
        onAnalysisComplete?.(data.analysis);
        toast.success('AI credit analysis complete!');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Failed to analyze credit profile');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score) => {
    if (score >= 70) return 'from-green-500 to-emerald-500';
    if (score >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  return (
    <Card className="card-glow overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI Credit Risk Analysis
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              </CardTitle>
              <CardDescription>
                Powered by advanced AI reasoning for transparent, explainable credit assessment
              </CardDescription>
            </div>
          </div>
          <Button 
            onClick={runAnalysis} 
            disabled={isAnalyzing || !walletData?.walletAddress}
            className="gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Run AI Analysis
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {!analysis && !isAnalyzing && (
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-8 w-8 text-primary/60" />
            </div>
            <div>
              <p className="text-muted-foreground">Click "Run AI Analysis" to get your comprehensive credit assessment</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Uses on-chain behavior to determine creditworthiness</p>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Brain className="h-10 w-10 text-primary animate-bounce" />
            </div>
            <div className="space-y-2">
              <p className="font-medium">AI is analyzing your wallet...</p>
              <p className="text-sm text-muted-foreground">Evaluating transaction history, repayment behavior, and risk factors</p>
            </div>
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  className="w-2 h-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Main Score Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Credit Score */}
              <div className="col-span-1 md:col-span-1 p-6 rounded-xl bg-gradient-to-br from-background to-muted/30 border border-border/50">
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground font-medium">AI Credit Score</p>
                  <div className={`text-5xl font-bold ${getScoreColor(analysis.credit_score)}`}>
                    {analysis.credit_score}
                  </div>
                  <p className="text-xs text-muted-foreground">out of 100</p>
                  <Progress 
                    value={analysis.credit_score} 
                    className="h-2"
                  />
                </div>
              </div>

              {/* Risk Level & Eligibility */}
              <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex flex-col items-center justify-center space-y-2">
                  <Shield className="h-8 w-8 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Risk Level</p>
                  <Badge className={`text-sm px-4 py-1 ${getRiskColor(analysis.risk_level)}`}>
                    {analysis.risk_level} Risk
                  </Badge>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex flex-col items-center justify-center space-y-2">
                  {analysis.loan_eligibility === 'Eligible' ? (
                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-400" />
                  )}
                  <p className="text-xs text-muted-foreground">Loan Status</p>
                  <Badge 
                    variant={analysis.loan_eligibility === 'Eligible' ? 'default' : 'destructive'}
                    className="text-sm px-4 py-1"
                  >
                    {analysis.loan_eligibility}
                  </Badge>
                </div>

                <div className="col-span-2 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Recommended Loan Amount</p>
                      <p className="text-2xl font-bold text-primary">
                        ${analysis.recommended_loan_amount_usd?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Target className="h-5 w-5 text-primary/50" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Explanation */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">AI Assessment Summary</h4>
              </div>
              <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg border border-border/50">
                {analysis.explanation}
              </p>
            </div>

            {/* AI Reasoning */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">AI Reasoning Breakdown</h4>
              </div>
              <ul className="space-y-2">
                {analysis.ai_reasoning_summary?.map((point, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30"
                  >
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-500/80">
                This AI assessment is for informational purposes. Final loan decisions may include additional verification steps. 
                Credit profiles are built on transparent, on-chain behavior.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AICreditAnalysis;
