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
            const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            const events = await fetchEvents(now.toISOString(), oneYearLater.toISOString());

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
                loading: function(isLoading) {
                    if (isLoading) {
                        fullCalendarEl.innerHTML = '<p>Loading events...</p>';
                    }
                },
                noEventsContent: 'No events to display'
            }).render();
        }

        const miniCalendarEl = document.getElementById('mini-calendar-container');
        if (miniCalendarEl) {
            const now = new Date();
            const thirtyDaysLater = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);
            const events = await fetchEvents(now.toISOString(), thirtyDaysLater.toISOString());

            new FullCalendar.Calendar(miniCalendarEl, {
                initialView: 'listMonth',
                headerToolbar: {
                    left: '',
                    center: 'title',
                    right: ''
                },
                height: 'auto',
                events: events,
                eventDidMount: function(info) {
                    console.log('Event mounted:', info.event.title);
                },
                noEventsContent: 'No upcoming events in the next 30 days',
                visibleRange: {
                    start: now,
                    end: thirtyDaysLater
                }
            }).render();
        }
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
