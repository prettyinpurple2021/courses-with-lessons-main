import { Request, Response, NextFunction } from 'express';
import {
  createClient,
  getAllClients,
  getClient,
  updateClient,
  deactivateClient,
  CreateClientInput,
} from '../services/oauthClientService.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

export class AdminOAuthController {
  /**
   * POST /api/admin/oauth/clients
   * Create a new OAuth client
   */
  async createClient(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, redirectUri, webhookUrl, webhookSecret } = req.body;

      if (!name || !redirectUri) {
        throw new ValidationError('name and redirectUri are required');
      }

      const input: CreateClientInput = {
        name,
        redirectUri,
        webhookUrl,
        webhookSecret,
      };

      const client = await createClient(input);

      return res.status(201).json({
        success: true,
        data: {
          client: {
            id: client.id,
            clientId: client.clientId,
            clientSecret: client.clientSecret, // Only shown once during creation
            name: client.name,
            redirectUri: client.redirectUri,
            webhookUrl: client.webhookUrl,
          },
          message: 'OAuth client created successfully. Save the clientSecret securely - it will not be shown again.',
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/admin/oauth/clients
   * List all OAuth clients
   */
  async listClients(req: Request, res: Response, next: NextFunction) {
    try {
      const clients = await getAllClients();

      // Remove sensitive data before returning
      const sanitizedClients = clients.map((client) => ({
        id: client.id,
        clientId: client.clientId,
        name: client.name,
        redirectUri: client.redirectUri,
        webhookUrl: client.webhookUrl,
        isActive: client.isActive,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      }));

      return res.status(200).json({
        success: true,
        data: {
          clients: sanitizedClients,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/admin/oauth/clients/:id
   * Get OAuth client details by ID
   */
  async getClientById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Try to find by clientId first
      let client = await getClient(id);

      // If not found by clientId, try by database ID
      if (!client) {
        const allClients = await getAllClients();
        client = allClients.find((c) => c.id === id) || null;
      }

      if (!client) {
        throw new NotFoundError('OAuth client not found');
      }

      // Remove sensitive data
      const sanitizedClient = {
        id: client.id,
        clientId: client.clientId,
        name: client.name,
        redirectUri: client.redirectUri,
        webhookUrl: client.webhookUrl,
        isActive: client.isActive,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      };

      return res.status(200).json({
        success: true,
        data: {
          client: sanitizedClient,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PUT /api/admin/oauth/clients/:id
   * Update OAuth client configuration
   */
  async updateClientById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, redirectUri, webhookUrl, webhookSecret } = req.body;

      // Find client by ID or clientId
      let client = await getClient(id);
      if (!client) {
        const allClients = await getAllClients();
        client = allClients.find((c) => c.id === id) || null;
      }

      if (!client) {
        throw new NotFoundError('OAuth client not found');
      }

      const updates: Partial<CreateClientInput> = {};
      if (name) updates.name = name;
      if (redirectUri) updates.redirectUri = redirectUri;
      if (webhookUrl !== undefined) updates.webhookUrl = webhookUrl;
      if (webhookSecret !== undefined) updates.webhookSecret = webhookSecret;

      const updatedClient = await updateClient(client.clientId, updates);

      if (!updatedClient) {
        throw new NotFoundError('Failed to update OAuth client');
      }

      // Remove sensitive data
      const sanitizedClient = {
        id: updatedClient.id,
        clientId: updatedClient.clientId,
        name: updatedClient.name,
        redirectUri: updatedClient.redirectUri,
        webhookUrl: updatedClient.webhookUrl,
        isActive: updatedClient.isActive,
        createdAt: updatedClient.createdAt,
        updatedAt: updatedClient.updatedAt,
      };

      return res.status(200).json({
        success: true,
        data: {
          client: sanitizedClient,
          message: 'OAuth client updated successfully',
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * DELETE /api/admin/oauth/clients/:id
   * Deactivate OAuth client
   */
  async deleteClient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Find client by ID or clientId
      let client = await getClient(id);
      if (!client) {
        const allClients = await getAllClients();
        client = allClients.find((c) => c.id === id) || null;
      }

      if (!client) {
        throw new NotFoundError('OAuth client not found');
      }

      await deactivateClient(client.clientId);

      return res.status(200).json({
        success: true,
        data: {
          message: 'OAuth client deactivated successfully',
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const adminOAuthController = new AdminOAuthController();

