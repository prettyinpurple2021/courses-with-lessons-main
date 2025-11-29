import { Request, Response, NextFunction } from 'express';
import * as eventService from '../services/eventService.js';

/**
 * GET /api/community/events
 * Get all upcoming events with registration status
 */
export async function getEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { type, startDate, endDate } = req.query;

    const filters: any = {};
    if (type) filters.type = type as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const events = await eventService.getEvents(userId, filters);

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/community/events/:id
 * Get event details by ID
 */
export async function getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const event = await eventService.getEventById(id, userId);

    if (!event) {
      res.status(404).json({
        success: false,
        error: { message: 'Event not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/community/events/:id/register
 * Register for an event
 */
export async function registerForEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await eventService.registerForEvent(userId, id);

    res.status(201).json({
      success: true,
      data: { message: 'Successfully registered for event' },
    });
  } catch (error: any) {
    if (error.message === 'Event not found') {
      res.status(404).json({
        success: false,
        error: { message: 'Event not found' },
      });
      return;
    }
    if (error.message === 'Event is full') {
      res.status(400).json({
        success: false,
        error: { message: 'This event is full' },
      });
      return;
    }
    if (error.message === 'Already registered for this event') {
      res.status(409).json({
        success: false,
        error: { message: 'You are already registered for this event' },
      });
      return;
    }
    next(error);
  }
}

/**
 * DELETE /api/community/events/:id/register
 * Unregister from an event
 */
export async function unregisterFromEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await eventService.unregisterFromEvent(userId, id);

    res.json({
      success: true,
      data: { message: 'Successfully unregistered from event' },
    });
  } catch (error: any) {
    if (error.message === 'Not registered for this event') {
      res.status(400).json({
        success: false,
        error: { message: 'You are not registered for this event' },
      });
      return;
    }
    next(error);
  }
}

/**
 * GET /api/community/events/my/registrations
 * Get user's registered events
 */
export async function getUserEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    const events = await eventService.getUserEvents(userId);

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    return next(error);
  }
}

