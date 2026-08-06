import { type GSTInvoice } from '../shared/schema';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api';

// ---- Socket.io singleton ----
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function joinUserRoom(userId: string) {
  const s = getSocket();
  s.emit('join', userId);
}

// ---- User ID (persisted per browser session) ----
export function getUserId(): string {
  let id = localStorage.getItem('nexus_user_id');
  if (!id) {
    id = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem('nexus_user_id', id);
  }
  return id;
}

// ---- Existing single-file API (backwards compatible) ----

export async function getAvailableModels(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/extract/models`, {
    headers: { 'ngrok-skip-browser-warning': 'true' }
  });
  if (!response.ok) {
    throw new Error('Server unreachable');
  }
  const data = await response.json();
  return data.models;
}

export interface CompanyContext {
  companyName: string;
  companyGSTIN: string;
  transactionType: 'purchase' | 'sale';
}

export async function extractInvoice(
  file: File,
  model?: string,
  companyContext?: CompanyContext
): Promise<GSTInvoice> {
  const formData = new FormData();
  formData.append('file', file);
  if (model) {
    formData.append('model', model);
  }
  if (companyContext) {
    formData.append('companyName', companyContext.companyName);
    formData.append('companyGSTIN', companyContext.companyGSTIN);
    formData.append('transactionType', companyContext.transactionType);
  }

  const response = await fetch(`${API_BASE_URL}/extract`, {
    method: 'POST',
    headers: { 'ngrok-skip-browser-warning': 'true' },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Failed to extract invoice data.';
    try {
      const errRes = await response.json();
      if (errRes.error) errorMessage = errRes.error;
    } catch (e) {
      // Ignore JSON parse error on error response
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data as any;
}

// ---- Batch upload API ----

export interface BatchJob {
  id: string | null;
  filename: string;
  status: 'queued' | 'extracting' | 'formatting_queued' | 'formatting' | 'cloud_processing' | 'completed' | 'failed';
  error?: string;
  result?: GSTInvoice;
  createdAt?: number;
  startedAt?: number;
  completedAt?: number;
}

export interface BatchUploadResponse {
  message: string;
  jobs: BatchJob[];
  maxFilesPerUpload: number;
}

export async function submitBatchExtraction(
  files: File[],
  model: string,
  userId: string,
  companyContext?: CompanyContext
): Promise<BatchUploadResponse> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }
  formData.append('model', model);
  formData.append('userId', userId);
  if (companyContext) {
    formData.append('companyName', companyContext.companyName);
    formData.append('companyGSTIN', companyContext.companyGSTIN);
    formData.append('transactionType', companyContext.transactionType);
  }

  const response = await fetch(`${API_BASE_URL}/extract/batch`, {
    method: 'POST',
    headers: { 'ngrok-skip-browser-warning': 'true' },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Failed to submit batch extraction.';
    try {
      const errRes = await response.json();
      if (errRes.error) errorMessage = errRes.error;
    } catch (e) { /* ignore */ }
    throw new Error(errorMessage);
  }

  return response.json();
}

// ---- Saved invoices ----

export async function getSavedInvoices(): Promise<(GSTInvoice & { id: string; savedAt: string })[]> {
  const response = await fetch(`${API_BASE_URL}/invoices`, {
    headers: { 'ngrok-skip-browser-warning': 'true' }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch invoices.');
  }
  return response.json();
}

export async function saveInvoice(invoice: GSTInvoice): Promise<GSTInvoice & { id: string; savedAt: string }> {
  const response = await fetch(`${API_BASE_URL}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
    body: JSON.stringify(invoice),
  });

  if (!response.ok) {
    throw new Error('Failed to save invoice.');
  }

  return response.json();
}

// ---- Bank Statement extraction ----

import { type BankStatement } from '../shared/bankStatementSchema';
export type { BankStatement };

export async function extractBankStatement(
  file: File,
  model?: string
): Promise<BankStatement> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', 'bank_statement');
  if (model) {
    formData.append('model', model);
  }

  const response = await fetch(`${API_BASE_URL}/extract`, {
    method: 'POST',
    headers: { 'ngrok-skip-browser-warning': 'true' },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Failed to extract bank statement data.';
    try {
      const errRes = await response.json();
      if (errRes.error) errorMessage = errRes.error;
    } catch (e) {
      // Ignore JSON parse error on error response
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data as BankStatement;
}
