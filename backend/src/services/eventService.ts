import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface EventWithRegistration {
  id: string;
  title: string;
  description: string;
  type: string;
  startTime: Date;
  endTime: Date;
  location: string | null;
  maxAttendees: number | null;
  registrationCount: number;
  isRegistered: boolean;
  isFull: boolean;
}

export interface EventFilters {
  type?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Get all events with registration status for a user
 */
export async function getEvents(
  userId: string,
  filters: EventFilters = {}
): Promise<EventWithRegistration[]> {
  const where: any = {
    startTime: { gte: new Date() }, // Only future events
  };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.startDate) {
    where.startTime = { ...where.startTime, gte: filters.startDate };
  }

  if (filters.endDate) {
    where.startTime = { ...where.startTime, lte: filters.endDate };
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { startTime: 'asc' },
    include: {
      _count: {
        select: { registrations: true },
      },
      registrations: {
        where: { userId },
        select: { id: true },
      },
    },
  });

  return events.map((event: any) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    type: event.type,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    maxAttendees: event.maxAttendees,
    registrationCount: event._count.registrations,
    isRegistered: event.registrations.length > 0,
    isFull: event.maxAttendees ? event._count.registrations >= event.maxAttendees : false,
  }));
}

/**
 * Get event by ID with registration status
 */
export async function getEventById(
  eventId: string,
  userId: string
): Promise<EventWithRegistration | null> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: { registrations: true },
      },
      registrations: {
        where: { userId },
        select: { id: true },
      },
    },
  });

  if (!event) {
    return null;
  }

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    type: event.type,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    maxAttendees: event.maxAttendees,
    registrationCount: (event as any)._count.registrations,
    isRegistered: (event as any).registrations.length > 0,
    isFull: event.maxAttendees ? (event as any)._count.registrations >= event.maxAttendees : false,
  };
}

/**
 * Register user for an event
 */
export async function registerForEvent(userId: string, eventId: string): Promise<void> {
  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: { registrations: true },
      },
    },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  // Check if event is full
  if (event.maxAttendees && (event as any)._count.registrations >= event.maxAttendees) {
    throw new Error('Event is full');
  }

  // Check if already registered
  const existingRegistration = await prisma.eventRegistration.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  if (existingRegistration) {
    throw new Error('Already registered for this event');
  }

  // Create registration
  await prisma.eventRegistration.create({
    data: {
      userId,
      eventId,
    },
  });
}

/**
 * Unregister user from an event
 */
export async function unregisterFromEvent(userId: string, eventId: string): Promise<void> {
  const registration = await prisma.eventRegistration.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  if (!registration) {
    throw new Error('Not registered for this event');
  }

  await prisma.eventRegistration.delete({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });
}

/**
 * Get user's registered events
 */
export async function getUserEvents(userId: string): Promise<EventWithRegistration[]> {
  const registrations = await prisma.eventRegistration.findMany({
    where: { userId },
    include: {
      event: {
        include: {
          _count: {
            select: { registrations: true },
          },
        },
      },
    },
    orderBy: {
      event: {
        startTime: 'asc',
      },
    },
  });

  return registrations.map((reg: any) => ({
    id: reg.event.id,
    title: reg.event.title,
    description: reg.event.description,
    type: reg.event.type,
    startTime: reg.event.startTime,
    endTime: reg.event.endTime,
    location: reg.event.location,
    maxAttendees: reg.event.maxAttendees,
    registrationCount: reg.event._count.registrations,
    isRegistered: true,
    isFull: reg.event.maxAttendees
      ? reg.event._count.registrations >= reg.event.maxAttendees
      : false,
  }));
}

/**
 * Create a new event (admin function)
 */
export async function createEvent(data: {
  title: string;
  description: string;
  type: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  maxAttendees?: number;
}) {
  return await prisma.event.create({
    data,
  });
}
