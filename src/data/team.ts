import type { ImageMetadata } from 'astro';
import david from '../assets/team/david.webp';
import stacey from '../assets/team/stacey.webp';

export interface Founder {
  name: string;
  title: string;
  summary: string;
  bio: string;
  photo: ImageMetadata;
  photoAlt: string;
}

// Approved by the owners 2026-11-12. Use verbatim; never name past employers or schools.
export const team: Founder[] = [
  {
    name: 'David Kemp',
    title: 'Director of Technology Implementation',
    summary:
      'More than a decade in enterprise IT support, field operations and technology implementation, from on-site troubleshooting to AI-assisted solutions.',
    bio: "David has spent more than a decade keeping enterprise technology working where it matters most: in the field, in front of the people who depend on it. He grew from field systems technician to lead technician, building a reputation for finding the root cause instead of patching the symptom. He then moved into technology implementation, where he prototyped new tools, built workflow automations and AI-assisted solutions, and guided them from pilot to rollout. Most recently he has managed operations and systems projects. David's prior experience with small organizations taught him how they really run and how technology impacts them. At Get Pro Edge, David leads how solutions are designed, built and delivered, pairing hands-on technical depth with plain-English communication and genuine care for the customer.",
    photo: david,
    photoAlt: 'Portrait of David Kemp',
  },
  {
    name: 'Stacey Grant',
    title: 'Director of Operations',
    summary:
      'More than twenty years leading operations, projects and teams, including technology rollouts to more than 100 locations.',
    bio: 'Stacey brings more than twenty years of operations, project management and people leadership, including fifteen years in field operations for a national organization. She has run planning and readiness for three districts and more than 80 locations, kept relocation and construction projects on schedule, and taken new technology from pilot to adoption across more than 100 offices. Her projects have merged separate platforms into one dashboard that saved roughly $100,000 a year, and introduced an AI-powered analysis tool that cut a 60-minute review to five minutes. She has hired, coached and developed teams of up to 20 people, with engagement scores well above company benchmarks. Earlier roles in recruiting, HR consulting and executive support in banking and telecommunications grounded her in compliance, reporting and service. At Get Pro Edge, Stacey makes sure every project is scoped clearly, every client knows what happens next, and the work is delivered on time.',
    photo: stacey,
    photoAlt: 'Portrait of Stacey Grant',
  },
];
