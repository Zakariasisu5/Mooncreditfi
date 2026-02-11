import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Mic
} from 'lucide-react';
import { toast } from 'sonner';

const demoScript = [
  {
    id: 'intro',
    title: 'Introduction',
    text: "Hi everyone, this is MoonCreditFi. We're building a credit-aware DeFi and DePIN protocol aligned with the Creditcoin ecosystem. The core idea is simple: on-chain credit history should unlock access to capital, not just collateral.",
    duration: 20,
  },
  {
    id: 'problem',
    title: 'The Problem',
    text: "Today, most DeFi lending protocols require users to over-collateralize. If you don't already have capital, you're locked out, even if you're trustworthy. At the same time, DePIN projects struggle to raise capital because ownership, impact, and revenue distribution are often unclear and off-chain.",
    duration: 25,
  },
  {
    id: 'solution',
    title: 'Our Solution',
    text: "MoonCreditFi solves both problems by extending Creditcoin's credit-first vision into a working DeFi and DePIN system. We introduce wallet-based credit profiles, reputation-driven lending pools, and transparent funding for real-world infrastructure, all enforced on-chain.",
    duration: 25,
  },
  {
    id: 'ai-engine',
    title: 'AI Credit Risk Engine',
    text: "At the heart of MoonCreditFi is our AI Credit Risk Engine. It analyzes on-chain wallet behavior using machine learning, not static rules. The engine evaluates transaction patterns, repayment history, and DeFi interactions to generate transparent, explainable credit scores. This enables fair access to credit for underbanked users who lack traditional credit history.",
    duration: 30,
  },
  {
    id: 'credit-profile',
    title: 'Credit Profile System',
    text: "Every wallet interacting with MoonCreditFi has an on-chain credit profile. This profile tracks loan history, repayment behavior, and overall reputation. There's no manual scoring, everything updates automatically through smart contract interactions. This credit profile becomes a portable on-chain reputation, reusable across the protocol.",
    duration: 30,
  },
  {
    id: 'lending-loop',
    title: 'Lending Reputation Loop',
    text: "When a user wants to borrow, access is influenced by their credit history, not just collateral size. After borrowing, repayment is enforced on-chain. Successful repayment increases reputation, which unlocks better access and better terms over time. This creates a closed loop: build credit, borrow, repay, reputation improves.",
    duration: 30,
  },
  {
    id: 'depin',
    title: 'DePIN Funding',
    text: "We also introduce a DePIN funding module. Users can fund real-world infrastructure like solar energy or compute networks using USD-denominated amounts. Ownership, contributions, and profit-sharing are recorded on-chain. Instead of interest-based lending, contributors receive transparent yield and proof-of-impact NFTs.",
    duration: 30,
  },
  {
    id: 'status',
    title: 'Current Status',
    text: "This is not a concept. We have deployed smart contracts, a working frontend, backend services with AI credit analysis, and a functional DePIN module running on testnet. MoonCreditFi shows how decentralized credit can move beyond speculation into real financial infrastructure. Thank you.",
    duration: 25,
  },
];

const NarratedDemoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [progress, setProgress] = useState(0);
  const [audioCache, setAudioCache] = useState({});
  const audioRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const currentScript = demoScript[currentSegment];
  const totalDuration = demoScript.reduce((acc, s) => acc + s.duration, 0);

  // Calculate overall progress
  const calculateOverallProgress = () => {
    let completedTime = 0;
    for (let i = 0; i < currentSegment; i++) {
      completedTime += demoScript[i].duration;
    }
    completedTime += (progress / 100) * currentScript.duration;
    return (completedTime / totalDuration) * 100;
  };

  const generateAudio = async (text) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('TTS Error:', error);
      throw error;
    }
  };

  const playSegment = async (segmentIndex) => {
    const segment = demoScript[segmentIndex];
    setIsLoading(true);
    setProgress(0);

    try {
      let audioUrl = audioCache[segment.id];
      
      if (!audioUrl) {
        audioUrl = await generateAudio(segment.text);
        setAudioCache(prev => ({ ...prev, [segment.id]: audioUrl }));
      }

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.muted = isMuted;
        
        audioRef.current.onloadedmetadata = () => {
          setIsLoading(false);
          audioRef.current.play();
          setIsPlaying(true);
          
          // Update progress
          progressIntervalRef.current = setInterval(() => {
            if (audioRef.current) {
              const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
              setProgress(currentProgress);
            }
          }, 100);
        };

        audioRef.current.onended = () => {
          clearInterval(progressIntervalRef.current);
          setProgress(100);
          
          // Auto-advance to next segment
          if (segmentIndex < demoScript.length - 1) {
            setTimeout(() => {
              setCurrentSegment(segmentIndex + 1);
              playSegment(segmentIndex + 1);
            }, 500);
          } else {
            setIsPlaying(false);
            setCurrentSegment(0);
            setProgress(0);
            toast.success('Demo narration complete!');
          }
        };
      }
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to generate audio. Please try again.');
    }
  };

  const handlePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      clearInterval(progressIntervalRef.current);
    } else {
      if (audioRef.current?.src && audioRef.current.currentTime > 0) {
        audioRef.current.play();
        setIsPlaying(true);
        progressIntervalRef.current = setInterval(() => {
          if (audioRef.current) {
            const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setProgress(currentProgress);
          }
        }, 100);
      } else {
        playSegment(currentSegment);
      }
    }
  };

  const handleReset = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
    setCurrentSegment(0);
    setProgress(0);
    clearInterval(progressIntervalRef.current);
  };

  const handleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const goToSegment = (index) => {
    if (index >= 0 && index < demoScript.length) {
      audioRef.current?.pause();
      clearInterval(progressIntervalRef.current);
      setCurrentSegment(index);
      setProgress(0);
      if (isPlaying) {
        playSegment(index);
      }
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      clearInterval(progressIntervalRef.current);
      Object.values(audioCache).forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // Preload next segment
  useEffect(() => {
    const preloadNext = async () => {
      const nextIndex = currentSegment + 1;
      if (nextIndex < demoScript.length && !audioCache[demoScript[nextIndex].id]) {
        try {
          const audioUrl = await generateAudio(demoScript[nextIndex].text);
          setAudioCache(prev => ({ ...prev, [demoScript[nextIndex].id]: audioUrl }));
        } catch (e) {
          // Preload failed, will try again when needed
        }
      }
    };
    if (isPlaying && currentSegment < demoScript.length - 1) {
      preloadNext();
    }
  }, [currentSegment, isPlaying]);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-6">
        <audio ref={audioRef} className="hidden" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI-Narrated Demo</h3>
          </div>
          <Badge variant="secondary">
            {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')} total
          </Badge>
        </div>

        {/* Current Segment Display */}
        <div className="mb-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline">{currentScript.title}</Badge>
            <span className="text-xs text-muted-foreground">
              {currentSegment + 1} / {demoScript.length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentScript.text}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Segment Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 mb-2" />
          
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Overall Progress</span>
            <span>{Math.round(calculateOverallProgress())}%</span>
          </div>
          <Progress value={calculateOverallProgress()} className="h-1" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToSegment(currentSegment - 1)}
            disabled={currentSegment === 0 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            size="lg"
            onClick={handlePlay}
            disabled={isLoading}
            className="gap-2 min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Play
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => goToSegment(currentSegment + 1)}
            disabled={currentSegment === demoScript.length - 1 || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" onClick={handleMute}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          <Button variant="outline" size="icon" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Segment Navigation */}
        <div className="flex flex-wrap gap-1 justify-center">
          {demoScript.map((segment, idx) => (
            <button
              key={segment.id}
              onClick={() => goToSegment(idx)}
              className={`px-2 py-1 text-xs rounded transition-all ${
                idx === currentSegment
                  ? 'bg-primary text-primary-foreground'
                  : idx < currentSegment
                  ? 'bg-green-500/20 text-green-500'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NarratedDemoPlayer;
