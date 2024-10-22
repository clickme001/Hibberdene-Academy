document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // Google Calendar API settings
    const API_KEY = 'AIzaSyAFy9H989WzchgCk5WK2XM_oPwrpoB6Ico';
    const CALENDAR_ID = 'fa71c7647406202b23f324f85523209b0b3e1cd21a160e4591967b0bfc8401ac@group.calendar.google.com';

    // Function to fetch events from Google Calendar API
    async function fetchEvents(timeMin, timeMax) {
        const url = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
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
        if (fullCalendarEl) {
            const now = new Date();
            const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            const events = await fetchEvents(oneYearAgo.toISOString(), oneYearLater.toISOString());

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
                },
                noEventsContent: 'No events to display'
            }).render();
        }

        const miniCalendarEl = document.getElementById('mini-calendar-container');
        if (miniCalendarEl) {
            const now = new Date();
            const sixtyDaysLater = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 60);
            const events = await fetchEvents(now.toISOString(), sixtyDaysLater.toISOString());

            console.log('Fetched events for mini calendar:', JSON.parse(JSON.stringify(events)));

            // Group events by date
            const groupedEvents = groupEventsByDate(events);

            // Clear existing content
            miniCalendarEl.innerHTML = '';

            // Render grouped events (limited to 2)
            let eventCount = 0;
            for (const [date, dayEvents] of Object.entries(groupedEvents).sort()) {
                if (eventCount >= 2) break;

                const dateEl = document.createElement('div');
                dateEl.className = 'fc-list-day';
                dateEl.innerHTML = `<div class="fc-list-day-cushion">${formatDate(date)}</div>`;
                miniCalendarEl.appendChild(dateEl);

                for (const event of dayEvents) {
                    if (eventCount >= 2) break;
                    const eventEl = document.createElement('div');
                    eventEl.className = 'fc-list-event';
                    eventEl.innerHTML = `
                        <div class="fc-list-event-time">${formatEventTime(event)}</div>
                        <div class="fc-list-event-title">${event.title}</div>
                    `;
                    miniCalendarEl.appendChild(eventEl);
                    eventCount++;
                }
            }

            // Add "View More" link if there are more than 2 events
            if (events.length > 2) {
                const viewMoreEl = document.createElement('div');
                viewMoreEl.className = 'fc-list-view-more';
                viewMoreEl.innerHTML = `<a href="calendar.html">View More</a>`;
                miniCalendarEl.appendChild(viewMoreEl);
            }

            console.log('Grouped events:', JSON.parse(JSON.stringify(groupedEvents)));
        }
    }

    function groupEventsByDate(events) {
        return events.reduce((groups, event) => {
            const date = new Date(event.start);
            const dateString = date.toISOString().split('T')[0];
            if (!groups[dateString]) {
                groups[dateString] = [];
            }
            groups[dateString].push(event);
            return groups;
        }, {});
    }

    function formatDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function formatEventTime(event) {
        if (event.allDay) {
            return 'All day';
        }
        const date = new Date(event.start);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    // Navigation toggle for mobile
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        const isClickInsideNav = navMenu.contains(event.target) || navToggle.contains(event.target);
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    });

    // Initialize calendars
    initializeCalendars();

    // Carousel functionality
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        const carouselItems = carousel.querySelectorAll('.carousel-item');
        const prevButton = carousel.querySelector('.prev');
        const nextButton = carousel.querySelector('.next');
        let currentIndex = 0;

        function showSlide(index) {
            carouselItems.forEach(item => item.classList.remove('active'));
            carouselItems[index].classList.add('active');
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % carouselItems.length;
            showSlide(currentIndex);
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
            showSlide(currentIndex);
        }

        nextButton.addEventListener('click', nextSlide);
        prevButton.addEventListener('click', prevSlide);

        // Auto-advance slides every 5 seconds
        setInterval(nextSlide, 5000);
    }
});
