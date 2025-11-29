import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface CreateClientInput {
  name: string;
  redirectUri: string;
  webhookUrl?: string;
  webhookSecret?: string;
}

export interface OAuthClientData {
  id: string;
  clientId: string;
  name: string;
  redirectUri: string;
  webhookUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generate unique client ID and secret pair
 */
export function generateClientCredentials(): { clientId: string; clientSecret: string } {
  // Generate random client ID (32 characters)
  const clientId = crypto.randomBytes(16).toString('hex');
  
  // Generate random client secret (64 characters for security)
  const clientSecret = crypto.randomBytes(32).toString('hex');
  
  return { clientId, clientSecret };
}

/**
 * Create a new OAuth client
 */
export async function createClient(input: CreateClientInput): Promise<{
  id: string;
  clientId: string;
  clientSecret: string;
  name: string;
  redirectUri: string;
  webhookUrl: string | null;
}> {
  const { clientId, clientSecret } = generateClientCredentials();
  
  // Hash the client secret before storing
  const hashedSecret = await hashPassword(clientSecret);
  
  // Create client in database
  const client = await prisma.oAuthClient.create({
    data: {
      clientId,
      clientSecret: hashedSecret,
      name: input.name,
      redirectUri: input.redirectUri,
      webhookUrl: input.webhookUrl || null,
      webhookSecret: input.webhookSecret || null,
      isActive: true,
    },
  });
  
  logger.info('OAuth client created', {
    clientId: client.clientId,
    name: client.name,
  });
  
  // Return client data with plaintext secret (only shown once during creation)
  return {
    id: client.id,
    clientId: client.clientId,
    clientSecret, // Return plaintext secret for the client to save
    name: client.name,
    redirectUri: client.redirectUri,
    webhookUrl: client.webhookUrl,
  };
}

/**
 * Get OAuth client by client ID
 */
export async function getClient(clientId: string): Promise<OAuthClientData | null> {
  const client = await prisma.oAuthClient.findUnique({
    where: { clientId },
    select: {
      id: true,
      clientId: true,
      name: true,
      redirectUri: true,
      webhookUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  return client;
}

/**
 * Validate client ID and secret combination
 */
export async function validateClientSecret(
  clientId: string,
  clientSecret: string
): Promise<boolean> {
  const client = await prisma.oAuthClient.findUnique({
    where: { clientId },
    select: {
      clientSecret: true,
      isActive: true,
    },
  });
  
  if (!client || !client.isActive) {
    return false;
  }
  
  // Compare provided secret with hashed secret
  const isValid = await comparePassword(clientSecret, client.clientSecret);
  
  return isValid;
}

/**
 * Validate OAuth client credentials
 */
export async function validateClient(
  clientId: string,
  clientSecret: string,
  redirectUri?: string
): Promise<OAuthClientData | null> {
  const isValid = await validateClientSecret(clientId, clientSecret);
  
  if (!isValid) {
    return null;
  }
  
  const client = await getClient(clientId);
  
  if (!client || !client.isActive) {
    return null;
  }
  
  // If redirect URI is provided, validate it matches
  if (redirectUri && client.redirectUri !== redirectUri) {
    return null;
  }
  
  return client;
}

/**
 * Update OAuth client configuration
 */
export async function updateClient(
  clientId: string,
  updates: Partial<CreateClientInput>
): Promise<OAuthClientData | null> {
  const updateData: any = {};
  
  if (updates.name) updateData.name = updates.name;
  if (updates.redirectUri) updateData.redirectUri = updates.redirectUri;
  if (updates.webhookUrl !== undefined) updateData.webhookUrl = updates.webhookUrl || null;
  if (updates.webhookSecret !== undefined) updateData.webhookSecret = updates.webhookSecret || null;
  
  const client = await prisma.oAuthClient.update({
    where: { clientId },
    data: updateData,
    select: {
      id: true,
      clientId: true,
      name: true,
      redirectUri: true,
      webhookUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  logger.info('OAuth client updated', { clientId, updates });
  
  return client;
}

/**
 * Deactivate an OAuth client
 */
export async function deactivateClient(clientId: string): Promise<void> {
  await prisma.oAuthClient.update({
    where: { clientId },
    data: { isActive: false },
  });
  
  logger.info('OAuth client deactivated', { clientId });
}

/**
 * Get all active OAuth clients
 */
export async function getAllClients(): Promise<OAuthClientData[]> {
  const clients = await prisma.oAuthClient.findMany({
    where: { isActive: true },
    select: {
      id: true,
      clientId: true,
      name: true,
      redirectUri: true,
      webhookUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  
  return clients;
}

