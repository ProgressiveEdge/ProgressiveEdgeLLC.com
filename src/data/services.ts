export interface Step {
  title: string;
  text: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Service {
  slug: string;
  number: string;
  title: string;
  promise: string;
  summary: string;
  metaDescription: string;
  included: string[];
  whoFor: string[];
  steps: Step[];
  faqs: Faq[];
}

// Draft copy for owner review (spec §11). Claims stay general and true.
export const services: Service[] = [
  {
    slug: 'managed-it',
    number: '01',
    title: 'Managed IT Support',
    promise: 'Your IT, handled.',
    summary: 'Help desk, Microsoft 365, computers and networks — looked after by a team that knows your setup.',
    metaDescription:
      'Managed IT support from Progressive Edge: help desk, remote support, Microsoft 365, devices, networks and security basics.',
    included: [
      'Help desk by phone, email and our support form',
      'Remote support',
      'Microsoft 365 administration — email, Teams, accounts and licenses',
      'Computers, printers, network and Wi-Fi',
      'New-employee setup and offboarding',
      'Security basics — updates and multi-factor sign-in',
    ],
    whoFor: ['Businesses without in-house IT', 'Teams whose IT person needs backup'],
    steps: [
      { title: 'Talk', text: 'Book a free call and tell us how your technology is set up today and what keeps going wrong.' },
      { title: 'Plan', text: 'We recommend a support plan that fits your team and give you a clear quote.' },
      { title: 'Support', text: 'We learn your systems, handle requests as they come in, and keep everything up to date.' },
    ],
    faqs: [
      {
        q: 'How do we ask for help?',
        a: 'Call us, email us, or use the support form on this site. Every request becomes a ticket, so nothing gets lost.',
      },
      {
        q: 'Can you work alongside our current IT person?',
        a: 'Yes. We can be their backup, take on specific areas, or handle the overflow.',
      },
      {
        q: 'Do you support Microsoft 365?',
        a: 'Yes. We manage accounts, licenses, email, Teams and security settings in Microsoft 365.',
      },
    ],
  },
  {
    slug: 'ai-automation',
    number: '02',
    title: 'AI & Automation',
    promise: 'Put AI to work on the busywork.',
    summary: 'AI phone agents, workflow automation and practical AI adoption that take busywork off your team.',
    metaDescription:
      'AI and automation from Progressive Edge: AI receptionists, workflow automation, AI adoption and custom assistants.',
    included: [
      'AI receptionist and phone agents that answer, route and take messages',
      'Workflow automation between the apps you already use',
      'AI adoption — choosing tools, staff training and usage policies',
      'Custom assistants grounded in your business information',
    ],
    whoFor: [
      'Teams buried in repetitive admin or manual data entry',
      'Businesses that miss calls when everyone is busy',
    ],
    steps: [
      { title: 'Talk', text: "Book a free call and walk us through the tasks that eat your team's time." },
      { title: 'Plan', text: 'We show you what AI or automation can take on, what it will cost, and what stays with people.' },
      { title: 'Support', text: 'We build it, test it with your team, and keep it running and improving.' },
    ],
    faqs: [
      {
        q: 'Will AI replace my staff?',
        a: 'Our aim is to take repetitive work off your team so they can spend more time on customers and higher-value work. People stay in the loop.',
      },
      {
        q: 'Is our data safe?',
        a: 'We choose tools with business-grade privacy terms, connect only the information each system needs, and explain where your data goes before anything is built.',
      },
      {
        q: 'Do we need new software?',
        a: 'Usually not. We start with the apps you already use, such as Microsoft 365, and connect them.',
      },
    ],
  },
  {
    slug: 'consulting',
    number: '03',
    title: 'Technology Consulting',
    promise: 'Senior technology thinking, without a full-time hire.',
    summary: 'Assessments, roadmaps and straight answers for the big technology decisions in front of you.',
    metaDescription:
      'Technology consulting from Progressive Edge: assessments, roadmaps, modernization, vendor selection and fractional leadership.',
    included: [
      'Technology assessment and roadmap',
      'Modernization — cloud and Microsoft 365 moves, retiring old systems',
      'Vendor and software selection',
      'Fractional technology leadership',
    ],
    whoFor: [
      'Growing organizations facing big technology decisions',
      'Owners who want a plain-English second opinion before they buy',
    ],
    steps: [
      { title: 'Talk', text: 'Book a free call and tell us about the decision or problem in front of you.' },
      { title: 'Plan', text: 'We review your current setup and give you a written recommendation with options and costs.' },
      { title: 'Support', text: 'We help you carry it out, or stay on as your part-time technology lead.' },
    ],
    faqs: [
      {
        q: 'What is fractional technology leadership?',
        a: 'Part-time, senior technology leadership — planning, budgeting, vendor management and decisions — without the cost of a full-time executive.',
      },
      {
        q: 'Will you just hand us a report?',
        a: 'No. Every recommendation comes with a clear plan, and we can stay to help you carry it out.',
      },
      {
        q: 'Can you work with our existing vendors?',
        a: 'Yes. We can manage vendors on your behalf or work alongside them.',
      },
    ],
  },
  {
    slug: 'websites',
    number: '04',
    title: 'Websites & Digital Products',
    promise: 'A web presence that brings in work.',
    summary: 'Websites, hosting, domains and online tools built to turn visitors into customers.',
    metaDescription:
      'Websites and digital products from Progressive Edge: design and build, hosting, domains, business email and online tools.',
    included: [
      'Website design and build',
      'Hosting, domains and business email setup',
      'Ongoing updates',
      'Digital products such as online tools, portals and forms',
    ],
    whoFor: ['Businesses with an outdated website, or none', 'Teams that need an online form, tool or portal'],
    steps: [
      { title: 'Talk', text: 'Book a free call and tell us what your website needs to do for your business.' },
      { title: 'Plan', text: 'We propose the pages, features and timeline, with a clear quote.' },
      { title: 'Support', text: 'We build and launch it, then keep it updated and secure.' },
    ],
    faqs: [
      {
        q: 'Can you improve our existing website?',
        a: 'Often, yes. We review what you have and recommend whether to improve it or start fresh.',
      },
      {
        q: 'Can you set up business email?',
        a: 'Yes. We set up domains and business email, usually with Microsoft 365.',
      },
      {
        q: 'Do you build things other than websites?',
        a: 'Yes — online tools, customer portals and forms that connect to the systems you already use.',
      },
    ],
  },
];
