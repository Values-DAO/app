"use client";

import { useInitialisedEvents } from "@/lib/utils";


export default function Page() {
    const { initialisedEvents, loading, error } = useInitialisedEvents();

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
      <div>
        {initialisedEvents.map((event) => (
          <div key={event.id}>
            <p>Community ID: {event.communityId}</p>
            <p>Token Name: {event.name}</p>
            <p>Created Token Address: {event.createdTokenAddy}</p>
          </div>
        ))}
      </div>
    );
}