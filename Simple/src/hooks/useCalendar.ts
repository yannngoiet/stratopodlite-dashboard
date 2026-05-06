'use client';

import { useState } from 'react';

interface CalendarEvent {
  id: string
  title: string
  start: Date | string
  end?: Date | string
  className: string
}

interface EventData {
  id: string
  title: string
}

const defaultEvents: CalendarEvent[] = [
  { id: '1', title: 'Interview - Backend Engineer', start: new Date(), end: new Date(), className: 'bg-transparent text-body border rounded border-light fw-medium' },
  { id: '2', title: 'Design Sprint Planning', start: new Date(Date.now() + 16000000), end: new Date(Date.now() + 20000000), className: 'bg-transparent text-body border rounded border-light fw-medium' },
  { id: '3', title: 'Project Kick-off Meeting', start: new Date(Date.now() + 400000000), end: new Date(Date.now() + 440000000), className: 'bg-transparent text-body border rounded border-light fw-medium' },
  { id: '4', title: 'UI/UX Design Review', start: new Date(Date.now() + 80000000), end: new Date(Date.now() + 180000000), className: 'bg-transparent text-body border rounded border-light fw-medium' },
  { id: '5', title: 'Code Review - Frontend', start: new Date(Date.now() + 200000000), end: new Date(Date.now() + 220000000), className: 'bg-transparent text-body border rounded border-light fw-medium' },
  { id: '6', title: 'Team Stand-up Meeting', start: new Date(Date.now() + 340000000), end: new Date(Date.now() + 345000000), className: 'bg-transparent text-body border rounded border-light fw-medium' },
  { id: '7', title: 'Client Presentation Prep', start: new Date(Date.now() + 1200000000), end: new Date(Date.now() + 1300000000), className: 'bg-transparent text-body border rounded border-light fw-medium' },
  { id: '8', title: 'Backend API Integration', start: new Date(Date.now() + 2500000000), end: new Date(Date.now() + 2600000000), className: 'bg-transparent text-body border rounded border-light fw-medium' },
];

const useCalendar = () => {
  const [show, setShow] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([...defaultEvents]);
  const [eventData, setEventData] = useState<EventData | undefined>();
  const [dateInfo, setDateInfo] = useState<any>();

  const onOpenModal = () => setShow(true);

  const onCloseModal = () => {
    setEventData(undefined);
    setDateInfo(undefined);
    setShow(false);
  };

  const onDateClick = (arg: any) => {
    setDateInfo(arg);
    onOpenModal();
    setIsEditable(false);
  };

  const onEventClick = (arg: any) => {
    const event: EventData = {
      id: arg.event.id,
      title: arg.event.title
    };
    setEventData(event);
    setIsEditable(true);
    onOpenModal();
  };

  const onDrop = (arg: any) => {
    const title = arg.draggedEl.title;
    if (title) {
      const newEvent: CalendarEvent = {
        id: arg.draggedEl.id,
        title,
        start: arg.dateStr ?? new Date(),
        end: undefined,
        className: arg.draggedEl.dataset.class
      };
      setEvents(prev => [...prev, newEvent]);
    }
  };

  const onAddEvent = (data: any) => {
    const newEvent: CalendarEvent = {
      id: String(events.length + 1),
      title: data.title,
      start: Object.keys(dateInfo ?? {}).length !== 0 ? dateInfo?.date : new Date(),
      className: 'bg-transparent text-body border rounded border-light fw-medium'
    };
    setEvents(prev => [...prev, newEvent]);
    onCloseModal();
  };

  const onUpdateEvent = (data: any) => {
    setEvents(events.map(e =>
      e.id === eventData?.id ? { ...e, title: data.title } : e
    ));
    onCloseModal();
    setIsEditable(false);
  };

  const onRemoveEvent = () => {
    setEvents(events.filter(e => e.id !== eventData?.id));
    onCloseModal();
  };

  const onEventDrop = (arg: any) => {
    setEvents(events.map(e =>
      e.id === arg.event.id
        ? { ...e, title: arg.event.title, className: arg.event.classNames, start: arg.event.start, end: arg.event.end }
        : e
    ));
    setIsEditable(false);
  };

  const createNewEvent = () => {
    setIsEditable(false);
    onOpenModal();
  };

  return {
    createNewEvent,
    show,
    onDateClick,
    onEventClick,
    onDrop,
    onEventDrop,
    events,
    onCloseModal,
    isEditable,
    eventData,
    onUpdateEvent,
    onRemoveEvent,
    onAddEvent
  };
};

export default useCalendar;