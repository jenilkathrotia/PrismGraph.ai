'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Network, Upload, Search, Shield, Lightbulb, Database,
  Cpu, ArrowRight, Sparkles, GitBranch
} from 'lucide-react';

// Animated particle node for background
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; r: number; color: string }[] = [];
    const colors = ['#00e5ff', '#7c4dff', '#00e676', '#448aff', '#ff5252', '#ffab40'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animId: number;
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        gradient.addColorStop(0, p.color + '30');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      animId = requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
}

const features = [
  {
    icon: <Upload className="w-6 h-6" />,
    title: 'Upload & Extract',
    description: 'Drop research PDFs and watch AI extract papers, authors, claims, methods, and relationships automatically.',
    color: 'var(--accent-cyan)',
  },
  {
    icon: <Network className="w-6 h-6" />,
    title: 'Live Knowledge Graph',
    description: 'Neo4j-powered graph connects every entity. Explore citations, clusters, and hidden relationships visually.',
    color: 'var(--accent-violet)',
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: 'Research Assistant',
    description: 'Ask complex research questions. Get evidence-grounded answers with graph traversal paths and source citations.',
    color: 'var(--accent-emerald)',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Verification Engine',
    description: 'Every answer is verified. Choose Fast, Balanced, or Strict mode for claim-by-claim evidence checking.',
    color: 'var(--accent-amber)',
  },
  {
    icon: <Lightbulb className="w-6 h-6" />,
    title: 'Insight Generation',
    description: 'Discover influential authors, emerging themes, contradictory findings, and unexplored research bridges.',
    color: 'var(--accent-rose)',
  },
  {
    icon: <GitBranch className="w-6 h-6" />,
    title: 'Contradiction Detection',
    description: 'Surface competing claims across papers. Understand where the field agrees and where debates remain open.',
    color: 'var(--accent-blue)',
  },
];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="gradient-bg-animated fixed inset-0 z-0" />
      <ParticleField />

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex items-center justify-between px-8 py-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00e5ff, #7c4dff)' }}>
            <Network className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">PrismGraph<span className="text-sm font-medium" style={{ color: 'var(--accent-cyan)' }}>.ai</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/workspace"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-smooth"
            style={{ background: 'linear-gradient(135deg, #00e5ff, #7c4dff)', boxShadow: '0 0 20px rgba(0,229,255,0.3)' }}
          >
            Launch Console
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 glass-card-sm"
          >
            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Powered by Neo4j + RocketRide AI</span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            <span className="text-white">Your Research, </span>
            <span className="gradient-text-hero">Connected & Verified</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Upload papers. Build a living knowledge graph. Ask questions with evidence-grounded answers.
            Verify every claim. Discover what the literature reveals.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/workspace"
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white transition-smooth hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #00e5ff, #7c4dff)', boxShadow: '0 0 30px rgba(0,229,255,0.3), 0 0 60px rgba(124,77,255,0.15)' }}
            >
              <Database className="w-5 h-5" />
              Open Research Console
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/workspace?demo=true"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold glass-card transition-smooth hover:scale-105"
              style={{ color: 'var(--text-primary)' }}
            >
              <Cpu className="w-5 h-5" style={{ color: 'var(--accent-cyan)' }} />
              Try Demo Dataset
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8"
        >
          <div className="w-6 h-10 rounded-full border-2 flex justify-center" style={{ borderColor: 'var(--text-muted)' }}>
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full mt-2"
              style={{ background: 'var(--accent-cyan)' }}
            />
          </div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 px-8 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Intelligence, Not Just Search
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Every feature leverages the graph + AI pipeline to deliver insights no simple chatbot can.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="glass-card p-6 hover:scale-[1.02] transition-smooth group cursor-default"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}15`, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Graph + AI working together in every step</p>
          </motion.div>

          <div className="space-y-8">
            {[
              { step: '01', title: 'Upload PDFs', desc: 'Drop research papers. RocketRide AI extracts entities, claims, and relationships.', icon: <Upload className="w-5 h-5" /> },
              { step: '02', title: 'Graph Forms', desc: 'Neo4j builds a connected knowledge graph with papers, authors, topics, methods, and citations.', icon: <Network className="w-5 h-5" /> },
              { step: '03', title: 'Ask & Explore', desc: 'Search the graph. Ask research questions. Get evidence-grounded, citation-backed answers.', icon: <Search className="w-5 h-5" /> },
              { step: '04', title: 'Verify & Discover', desc: 'Verification agent checks claims. Insight engine reveals hidden patterns and contradictions.', icon: <Shield className="w-5 h-5" /> },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-6 flex items-start gap-6"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center gradient-text text-2xl font-black"
                  style={{ background: 'rgba(0,229,255,0.1)' }}>
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold" style={{ color: 'var(--accent-cyan)' }}>STEP {item.step}</span>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="relative z-10 px-8 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass-card p-12"
          style={{ boxShadow: '0 0 40px rgba(0,229,255,0.1), 0 0 80px rgba(124,77,255,0.05)' }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Map Your Research?</h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            Upload your first papers and let the graph reveal what you&apos;ve been missing.
          </p>
          <Link
            href="/workspace"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-base font-bold text-white transition-smooth hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #00e5ff, #7c4dff)', boxShadow: '0 0 30px rgba(0,229,255,0.3)' }}
          >
            Launch Console <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        <p>PrismGraph.ai — Built with Neo4j + RocketRide AI</p>
      </footer>
    </div>
  );
}
