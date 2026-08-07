'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Brain,
  Zap,
  Target,
  TrendingUp,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  Layers,
} from 'lucide-react';
import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const features = [
  {
    icon: Brain,
    title: 'Adaptive AI Interviewer',
    description:
      'Questions adapt in real-time based on your answers. Strong responses trigger deeper challenges; weak ones get conceptual clarification.',
  },
  {
    icon: Target,
    title: 'Curriculum-Aware',
    description:
      'Questions are generated from your actual curriculum data — 31 days, 8 modules, covering RAG, embeddings, agents, MCP, and deployment.',
  },
  {
    icon: TrendingUp,
    title: 'Strength & Weakness Tracking',
    description:
      'The engine tracks which topics you excel at and where you struggle, building a profile across every question.',
  },
  {
    icon: BarChart3,
    title: 'Structured Feedback',
    description:
      'Get a detailed report with topic scores, improvement areas, and a recommended learning path after each interview.',
  },
  {
    icon: MessageSquare,
    title: 'Conversational Flow',
    description:
      'Not a quiz. The agent maintains context, asks follow-ups, and conducts a natural technical conversation.',
  },
  {
    icon: ShieldCheck,
    title: 'Production Architecture',
    description:
      'Built with clean architecture, TypeScript, and a modular service layer ready to plug into any LLM backend.',
  },
];

const steps = [
  {
    icon: Layers,
    title: 'Select a Candidate',
    description:
      'Choose from 20 candidate profiles, each with their own curriculum history, strengths, and gaps.',
  },
  {
    icon: Brain,
    title: 'AI Conducts the Interview',
    description:
      'The agent asks adaptive questions across at least 4 curriculum areas, with a minimum of 8 questions.',
  },
  {
    icon: BarChart3,
    title: 'Get Structured Feedback',
    description:
      'Receive scores across 11 dimensions, identified strengths, gaps, and a personalized learning path.',
  },
];

const faqs = [
  {
    q: 'How does the AI interviewer adapt?',
    a: 'The engine evaluates each answer based on depth, keyword usage, and specificity. Strong answers increase difficulty; shallow answers trigger follow-up questions; weak answers prompt conceptual clarification. The interviewer moves naturally between curriculum topics.',
  },
  {
    q: 'What curriculum does it cover?',
    a: 'The platform covers a 31-day AI engineering curriculum with 8 modules: Environment & Tooling, Data Foundations, Embeddings & Vector Search, LLM Core & Prompting, Chatbot Build, Agentic AI & MCP, Evaluation & Deployment, and Production & Capstone.',
  },
  {
    q: 'How many questions are asked?',
    a: 'Each interview includes a minimum of 8 questions covering at least 4 different curriculum days. The agent may ask follow-up questions based on your answers, extending the interview naturally.',
  },
  {
    q: 'What feedback do I get?',
    a: 'You receive an overall readiness score, 11 topic-specific scores (technical, prompt engineering, RAG, vector databases, AI agents, MCP, deployment, communication, confidence, reasoning, readiness), identified strengths and gaps, improvement areas, and a recommended learning path.',
  },
  {
    q: 'Can I replace the data with my own?',
    a: 'Yes. The curriculum and candidate data are stored as local JSON files in the /data directory. The parser service layer reads these files, so you can swap them with your own curriculum and candidate profiles.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              The AI Interview Agent
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Not a chatbot. Not a quiz. An adaptive AI interviewer that conducts
              realistic technical interviews based on your curriculum, tracks
              strengths and weaknesses, and generates structured feedback.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Start an Interview
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline">
                  See How It Works
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-16 max-w-5xl"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { value: '8+', label: 'Questions per interview' },
                { value: '4+', label: 'Curriculum areas covered' },
                { value: '11', label: 'Scoring dimensions' },
              ].map((stat) => (
                <Card key={stat.label} className="glass p-6 text-center">
                  <div className="text-3xl font-bold text-gradient">{stat.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for realistic technical interviews
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every feature is designed to simulate the experience of being
              interviewed by a senior AI engineer.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="h-full p-6 transition-colors hover:border-primary/40">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-muted-foreground">
              Three steps from candidate selection to structured feedback.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="mt-2 text-sm font-medium text-primary">
                    Step {i + 1}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="absolute -right-4 top-8 hidden h-6 w-6 text-muted-foreground/40 md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interview Process */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                The interview process
              </h2>
              <p className="mt-4 text-muted-foreground">
                The agent follows a structured but conversational flow —
                welcoming the candidate, asking adaptive questions, generating
                follow-ups, and compiling a final report.
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  { icon: MessageSquare, text: 'Welcomes the candidate by name and role' },
                  { icon: Brain, text: 'Asks curriculum-based questions starting from fundamentals' },
                  { icon: Zap, text: 'Evaluates answer depth and adjusts difficulty' },
                  { icon: Target, text: 'Generates targeted follow-up questions' },
                  { icon: TrendingUp, text: 'Tracks strengths and weaknesses across topics' },
                  { icon: BarChart3, text: 'Compiles structured feedback with scores' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Card className="glass p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                      <Brain className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-semibold">Interview Agent</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Welcome, Sarah. I'll be conducting your technical interview today. Let's start with embeddings — what's the core concept?",
                      'Good answer. Now, how would you use ChromaDB in a RAG pipeline? Walk me through the workflow.',
                      'Excellent. Let me push further — what are the trade-offs between local and managed vector databases at scale?',
                    ].map((msg, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-muted/50 p-3 text-sm"
                      >
                        {msg}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Interview in progress...</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-muted/30 py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="mt-12">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="glass overflow-hidden p-12 text-center">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to test your AI engineering knowledge?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Start an interview now and get structured feedback across 11
                scoring dimensions.
              </p>
              <Link href="/dashboard" className="mt-8 inline-block">
                <Button size="lg" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Start Interview
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
