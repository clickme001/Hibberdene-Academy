document.addEventListener('DOMContentLoaded', () => {
    // Function to fetch API key and Calendar ID from server-side endpoint
    async function fetchCredentials() {
        try {
            const response = await fetch('/api/credentials');
            const data = await response.json();
            if (!data.apiKey || !data.calendarId) {
                console.error('API key or Calendar ID not found in response:', data);
                return null;
            }
            return data;
        } catch (error) {
            console.error('Error fetching credentials:', error);
            return null;
        }
    }

    // Function to fetch events from Google Calendar API
    async function fetchEvents(apiKey, calendarId, timeMin, timeMax) {
        const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (!data.items) {
                console.error('No events found or error in response:', data);
                return [];
            }

            console.log('Fetched events:', data.items); // Log fetched events
            return data.items.map(event => ({
                title: event.summary,
                start: event.start.dateTime || event.start.date,
                end: event.end.dateTime || event.end.date,
                allDay: !event.start.dateTime
            }));
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    }

    // Function to initialize calendars
    async function initializeCalendars() {
        const fullCalendarEl = document.getElementById('full-calendar-container');
        const miniCalendarEl = document.getElementById('mini-calendar-container');

        if (fullCalendarEl || miniCalendarEl) {
            const credentials = await fetchCredentials();
            if (!credentials) {
                console.error('Failed to fetch credentials');
                return;
            }

            const now = new Date();
            const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            const events = await fetchEvents(credentials.apiKey, credentials.calendarId, oneYearAgo.toISOString(), oneYearLater.toISOString());
            console.log('Events to render:', events); // Log events to render

            if (fullCalendarEl) {
                new FullCalendar.Calendar(fullCalendarEl, {
                    initialView: 'dayGridMonth',
                    headerToolbar: {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
                    },
                    height: 'auto',
                    events: events,
                    eventDidMount: function(info) {
                        console.log('Event mounted:', info.event.title);
                        const eventEl = info.el;
                        const isExam = info.event.title.toLowerCase().includes('exam');
                        const eventDate = new Date(info.event.start);
                        const isWeekend = eventDate.getDay() === 0 || eventDate.getDay() === 6;

                        if (isExam && !isWeekend) {
                            eventEl.style.backgroundColor = 'yellow';
                            eventEl.style.borderColor = 'yellow';
                            eventEl.style.color = 'black';
                            
                            const eventTitleEl = eventEl.querySelector('.fc-event-title');
                            if (eventTitleEl) {
                                eventTitleEl.style.color = 'black';
                            }
                        }

                        // Add tooltip
                        tippy(eventEl, {
                            content: `
                                <strong>${info.event.title}</strong><br>
                                Date: ${eventDate.toLocaleDateString()}<br>
                                Time: ${eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            `,
                            allowHTML: true,
                            theme: 'light-border',
                        });
                    }
                }).render();
            }

            if (miniCalendarEl) {
                const miniEvents = events.slice(0, 5); // Show only the first 5 events
                miniCalendarEl.innerHTML = '<h3>Upcoming Events</h3>';
                miniEvents.forEach(event => {
                    const eventDate = new Date(event.start);
                    const eventEl = document.createElement('div');
                    eventEl.className = 'mini-calendar-event';
                    const isExam = event.title.toLowerCase().includes('exam');
                    const isWeekend = eventDate.getDay() === 0 || eventDate.getDay() === 6;
                    if (isExam && !isWeekend) {
                        eventEl.style.backgroundColor = 'yellow';
                        eventEl.style.color = 'black';
                    }
                    eventEl.innerHTML = `
                        <strong>${eventDate.toLocaleDateString()}</strong>: ${event.title}
                    `;
                    miniCalendarEl.appendChild(eventEl);
                });
            }
        }
    }

    // Initialize calendars
    initializeCalendars();
});
