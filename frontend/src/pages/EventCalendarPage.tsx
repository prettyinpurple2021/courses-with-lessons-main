import React, { useState, useEffect } from 'react';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import { getEvents, registerForEvent, unregisterFromEvent } from '../services/forumService';
import { Event } from '../types/forum';
import { useToast } from '../hooks/useToast';
import { format, parseISO } from 'date-fns';

const EventCalendarPage: React.FC = () => {
  const toast = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [selectedType]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (selectedType) filters.type = selectedType;

      const data = await getEvents(filters);
      setEvents(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    try {
      await registerForEvent(eventId);
      toast.success('Successfully registered for event');
      loadEvents(); // Reload to update registration status
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to register for event');
    }
  };

  const handleUnregister = async (eventId: string) => {
    try {
      await unregisterFromEvent(eventId);
      toast.success('Successfully unregistered from event');
      loadEvents(); // Reload to update registration status
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to unregister from event');
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'webinar':
        return 'bg-blue-500/20 text-blue-400 border-blue-400';
      case 'workshop':
        return 'bg-purple-500/20 text-purple-400 border-purple-400';
      case 'networking':
        return 'bg-hot-pink/20 text-hot-pink border-hot-pink';
      default:
        return 'bg-steel-grey/20 text-steel-grey border-steel-grey';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'webinar':
        return '🎥';
      case 'workshop':
        return '🛠️';
      case 'networking':
        return '🤝';
      default:
        return '📅';
    }
  };

  return (
    <div className="min-h-screen camo-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Event Calendar</h1>
          <p className="text-steel-grey">Join webinars, workshops, and networking events</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedType('')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedType === ''
                ? 'bg-hot-pink text-white'
                : 'bg-white/10 text-steel-grey hover:bg-white/20'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setSelectedType('webinar')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedType === 'webinar'
                ? 'bg-hot-pink text-white'
                : 'bg-white/10 text-steel-grey hover:bg-white/20'
            }`}
          >
            🎥 Webinars
          </button>
          <button
            onClick={() => setSelectedType('workshop')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedType === 'workshop'
                ? 'bg-hot-pink text-white'
                : 'bg-white/10 text-steel-grey hover:bg-white/20'
            }`}
          >
            🛠️ Workshops
          </button>
          <button
            onClick={() => setSelectedType('networking')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedType === 'networking'
                ? 'bg-hot-pink text-white'
                : 'bg-white/10 text-steel-grey hover:bg-white/20'
            }`}
          >
            🤝 Networking
          </button>
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="text-center text-white py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hot-pink"></div>
            <p className="mt-4">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <GlassmorphicCard variant="default" className="p-8 text-center">
            <p className="text-steel-grey text-lg">No upcoming events</p>
          </GlassmorphicCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <GlassmorphicCard
                key={event.id}
                variant="default"
                className="p-6 hover:scale-[1.02] transition-transform duration-200"
              >
                {/* Event Type Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold border ${getEventTypeColor(
                      event.type
                    )}`}
                  >
                    {getEventTypeIcon(event.type)} {event.type.toUpperCase()}
                  </span>
                  {event.isRegistered && (
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-success-teal/20 text-success-teal border border-success-teal">
                      ✓ Registered
                    </span>
                  )}
                </div>

                {/* Event Title */}
                <h3 className="text-2xl font-bold text-white mb-3">{event.title}</h3>

                {/* Event Description */}
                <p className="text-steel-grey mb-4">{event.description}</p>

                {/* Event Details */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-white">
                    <span>📅</span>
                    <span>{format(parseISO(event.startTime), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <span>🕐</span>
                    <span>
                      {format(parseISO(event.startTime), 'h:mm a')} -{' '}
                      {format(parseISO(event.endTime), 'h:mm a')}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-white">
                      <span>📍</span>
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.maxAttendees && (
                    <div className="flex items-center gap-2 text-white">
                      <span>👥</span>
                      <span>
                        {event.registrationCount} / {event.maxAttendees} attendees
                      </span>
                    </div>
                  )}
                </div>

                {/* Registration Button */}
                {event.isRegistered ? (
                  <button
                    onClick={() => handleUnregister(event.id)}
                    className="w-full px-6 py-3 bg-steel-grey text-white font-bold rounded-lg hover:bg-steel-grey/80 transition-all"
                  >
                    Unregister
                  </button>
                ) : event.isFull ? (
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-white/10 text-steel-grey font-bold rounded-lg cursor-not-allowed"
                  >
                    Event Full
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegister(event.id)}
                    className="w-full px-6 py-3 bg-hot-pink text-white font-bold rounded-lg hover:bg-hot-pink/80 transition-all holographic-shimmer"
                  >
                    Register Now
                  </button>
                )}
              </GlassmorphicCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCalendarPage;
