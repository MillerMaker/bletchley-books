import React from 'react'
import Header from '../components/Header'
import EventLog from '../components/EventLog'

function EventLogPage() {
  return (
    <>
      <Header homePath="/private-outlet/event-log" title="Event Log"  />
      <EventLog />
    </>   
  )
}

export default EventLogPage