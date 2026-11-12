import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

interface N8nNode {
  name: string;
  type: string;
  parameters: Record<string, any>;
  onError?: string;
}
interface Workflow {
  nodes: N8nNode[];
  connections: Record<string, { main: { node: string }[][] }>;
}
interface Item {
  json: { body: Record<string, string> };
  binary?: Record<string, { fileName: string; mimeType: string }>;
}

const load = (file: string): Workflow => JSON.parse(readFileSync(new URL(`../n8n/${file}`, import.meta.url), 'utf8'));

function node(wf: Workflow, name: string): N8nNode {
  const found = wf.nodes.find((n) => n.name === name);
  if (!found) throw new Error(`missing node "${name}"`);
  return found;
}

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (
  ...args: string[]
) => (...args: unknown[]) => Promise<unknown>;

/** Runs a workflow's "Build ticket" Code node the way n8n does: $input in scope, helpers on `this`. */
async function buildTicket(file: string, item: Item, buffers: Record<string, Buffer> = {}) {
  const run = new AsyncFunction('$input', node(load(file), 'Build ticket').parameters.jsCode as string);
  const context = { helpers: { getBinaryDataBuffer: async (_index: number, key: string) => buffers[key] } };
  const output = (await run.call(context, { first: () => item })) as [{ json: { ticket: Record<string, any> } }];
  return output[0].json.ticket;
}

describe('contact workflow', () => {
  const body = {
    name: 'Pat Doe',
    email: 'pat@example.com',
    company: 'Acme',
    phone: '',
    service: 'AI & Automation',
    message: 'We miss calls.',
    submitted_at: '2026-11-12T15:00:00.000Z',
  };

  it('builds a Sales ticket with every filled-in detail', async () => {
    const ticket = await buildTicket('contact-to-zammad.json', { json: { body } });
    expect(ticket.title).toBe('Website lead: Pat Doe — AI & Automation');
    expect(ticket.group).toBe('Sales');
    expect(ticket.customer_id).toBe('guess:pat@example.com');
    expect(ticket.article).toMatchObject({ type: 'web', sender: 'Customer', internal: false, content_type: 'text/plain' });
    expect(ticket.article.body).toBe(
      'Name: Pat Doe\nEmail: pat@example.com\nCompany: Acme\nService: AI & Automation\nSubmitted: 2026-11-12T15:00:00.000Z\n\nWe miss calls.',
    );
  });

  it('falls back to "Not sure yet" when no service was chosen', async () => {
    const ticket = await buildTicket('contact-to-zammad.json', { json: { body: { ...body, service: '' } } });
    expect(ticket.title).toBe('Website lead: Pat Doe — Not sure yet');
  });
});

describe('support workflow', () => {
  const body = {
    name: 'Pat Doe',
    company: 'Acme',
    email: 'pat@example.com',
    phone: '989-555-0100',
    preferred_contact_method: 'Phone',
    category: 'Hardware',
    priority: 'Normal',
    subject: 'Server down',
    description: 'Nobody can sign in.',
    issue_started: 'This morning',
    users_affected: 'Everyone',
    troubleshooting_attempted: 'Restarted it',
    best_contact_time: 'Any time',
    remote_support_permission: 'yes',
    submitted_at: '2026-11-12T15:00:00.000Z',
  };
  const supportTicket = (
    overrides: Record<string, string> = {},
    binary?: Item['binary'],
    buffers: Record<string, Buffer> = {},
  ) => buildTicket('support-to-zammad.json', { json: { body: { ...body, ...overrides } }, binary }, buffers);

  it.each([
    ['Critical', '3 high', 'critical'],
    ['High', '3 high', undefined],
    ['Normal', '2 normal', undefined],
    ['Low', '1 low', undefined],
  ])('maps priority %s to "%s"', async (priority, zammadPriority, tag) => {
    const ticket = await supportTicket({ priority });
    expect(ticket.priority).toBe(zammadPriority);
    expect(ticket.tags).toBe(tag);
  });

  it('puts the request in the Support group with every detail in the body', async () => {
    const ticket = await supportTicket();
    expect(ticket.title).toBe('Server down');
    expect(ticket.group).toBe('Support');
    expect(ticket.customer_id).toBe('guess:pat@example.com');
    expect(ticket.article.body).toContain('Preferred contact: Phone');
    expect(ticket.article.body).toContain('Who is affected: Everyone');
    expect(ticket.article.body).toContain('Remote support allowed: Yes');
    expect(ticket.article.body).toContain('Description:\nNobody can sign in.');
    expect(ticket.article.body).toContain('Already tried:\nRestarted it');
    expect(ticket.article.attachments).toEqual([]);
  });

  it('says No to remote support and drops empty details', async () => {
    const ticket = await supportTicket({ remote_support_permission: '', troubleshooting_attempted: '', phone: '' });
    expect(ticket.article.body).toContain('Remote support allowed: No');
    expect(ticket.article.body).not.toContain('Already tried');
    expect(ticket.article.body).not.toContain('Phone:');
  });

  it('base64-encodes attachment_N files in order and ignores other binaries', async () => {
    const ticket = await supportTicket(
      {},
      {
        attachment_2: { fileName: 'error.txt', mimeType: 'text/plain' },
        attachment_1: { fileName: 'screen.png', mimeType: 'image/png' },
        data: { fileName: 'stray.bin', mimeType: 'application/octet-stream' },
      },
      { attachment_1: Buffer.from('png-bytes'), attachment_2: Buffer.from('log') },
    );
    expect(ticket.article.attachments).toEqual([
      { filename: 'screen.png', data: Buffer.from('png-bytes').toString('base64'), 'mime-type': 'image/png' },
      { filename: 'error.txt', data: Buffer.from('log').toString('base64'), 'mime-type': 'text/plain' },
    ]);
  });

  it('returns the Zammad ticket number to the website', () => {
    expect(node(load('support-to-zammad.json'), 'Respond OK').parameters.responseBody).toContain(
      'ticketNumber: String($json.number)',
    );
  });
});

describe.each([
  ['contact-to-zammad.json', 'website-contact'],
  ['support-to-zammad.json', 'website-support'],
])('%s wiring', (file, path) => {
  const wf = load(file);
  const hook = wf.nodes.find((n) => n.type === 'n8n-nodes-base.webhook');

  it('listens on the right path with header auth and a response node', () => {
    expect(hook?.parameters).toMatchObject({
      httpMethod: 'POST',
      path,
      authentication: 'headerAuth',
      responseMode: 'responseNode',
    });
  });

  it('runs webhook → Build ticket → Create Zammad ticket', () => {
    expect(wf.connections[hook?.name ?? ''].main[0][0].node).toBe('Build ticket');
    expect(wf.connections['Build ticket'].main[0][0].node).toBe('Create Zammad ticket');
  });

  it('creates the ticket through the internal Zammad address', () => {
    const http = node(wf, 'Create Zammad ticket');
    expect(http.parameters.url).toBe('http://zammad-nginx:8080/api/v1/tickets');
    expect(http.parameters.authentication).toBe('genericCredentialType');
    expect(http.parameters.genericAuthType).toBe('httpHeaderAuth');
    expect(http.onError).toBe('continueErrorOutput');
  });

  it('answers 502 when Zammad fails', () => {
    const outputs = wf.connections['Create Zammad ticket'].main;
    expect(outputs[0][0].node).toBe('Respond OK');
    expect(outputs[1][0].node).toBe('Respond error');
    expect(node(wf, 'Respond error').parameters.options.responseCode).toBe(502);
  });
});
