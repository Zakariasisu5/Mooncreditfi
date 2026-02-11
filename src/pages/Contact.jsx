import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, MessageSquare, Send, Twitter, Github, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Create mailto link with form data
    const mailtoLink = `mailto:zakariasisu5@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`;
    window.location.href = mailtoLink;
    toast.success('Opening your email client to send the message.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const socialLinks = [
    { icon: Twitter, label: 'Twitter', href: '#', username: '@MoonCreditFi' },
    { icon: Github, label: 'GitHub', href: '#', username: 'mooncreditfi' },
    { icon: Globe, label: 'Website', href: '#', username: 'mooncreditfi.io' },
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
            <img src="/logo.png" alt="MoonCreditFi logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-md object-cover" onError={(e) => { e.currentTarget.src = '/moonfi-logo.svg'; }} />
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
              <MessageSquare className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Get in <span className="mooncreditfi-glow">Touch</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="card-glow">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Send us a message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="btn-mooncreditfi w-full">
                    Send Message
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="card-glow">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold mb-4">Connect With Us</h2>
                  <p className="text-muted-foreground mb-6">
                    Join our community and stay updated with the latest news, updates, and announcements.
                  </p>
                  <div className="space-y-4">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                      >
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <social.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{social.label}</p>
                          <p className="text-sm text-muted-foreground">{social.username}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glow">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold mb-4">FAQ</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold mb-1">How do I get started?</p>
                      <p className="text-sm text-muted-foreground">
                        Connect your wallet and explore our lending and borrowing features.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">What networks do you support?</p>
                      <p className="text-sm text-muted-foreground">
                        We're built on Creditcoin Testnet with multi-chain support coming soon.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Is my money safe?</p>
                      <p className="text-sm text-muted-foreground">
                        Our smart contracts are audited and we follow best security practices.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
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

export default Contact;
