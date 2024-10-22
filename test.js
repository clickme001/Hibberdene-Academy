document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');

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
                    const eventEl = info.el;
                    const isExam = info.event.title.toLowerCase().includes('exam');
                    const eventDate = new Date(info.event.start);
                    const isWeekend = eventDate.getDay() === 0 || eventDate.getDay() === 6;

                    if (isExam && !isWeekend) {
                        eventEl.style.backgroundColor = 'yellow';
                        eventEl.style.borderColor = 'yellow';
                        eventEl.style.color = 'black';
                    } else {
                        // Reset to default colors for non-exam events or weekend exams
                        eventEl.style.backgroundColor = '';
                        eventEl.style.borderColor = '';
                        eventEl.style.color = '';
                    }

                    // Ensure the event title text color is set correctly
                    const eventTitleEl = eventEl.querySelector('.fc-event-title');
                    if (eventTitleEl) {
                        eventTitleEl.style.color = isExam && !isWeekend ? 'black' : '';
                    }
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
                    const isExam = event.title.toLowerCase().includes('exam');
                    const eventDate = new Date(event.start);
                    const isWeekend = eventDate.getDay() === 0 || eventDate.getDay() === 6;

                    const eventTitleEl = document.createElement('div');
                    eventTitleEl.className = 'fc-list-event-title';
                    eventTitleEl.textContent = event.title;

                    if (isExam && !isWeekend) {
                        eventTitleEl.style.backgroundColor = 'yellow';
                        eventTitleEl.style.color = 'black';
                    } else {
                        eventTitleEl.style.backgroundColor = '';
                        eventTitleEl.style.color = '';
                    }

                    eventEl.innerHTML = `
                        <div class="fc-list-event-time">${formatEventTime(event)}</div>
                    `;
                    eventEl.appendChild(eventTitleEl);
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
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Dropdown functionality
    dropdowns.forEach(dropdown => {
        const dropdownToggle = dropdown.querySelector('.dropbtn');
        const dropdownContent = dropdown.querySelector('.dropdown-content');

        if (dropdownToggle && dropdownContent) {
            dropdownToggle.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdownContent.classList.toggle('active');
                }
            });

            // Close dropdown when a link inside is clicked
            dropdownContent.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        navMenu.classList.remove('active');
                        dropdowns.forEach(d => {
                            const content = d.querySelector('.dropdown-content');
                            if (content) content.classList.remove('active');
                        });
                    }
                });
            });
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        const isClickInsideNav = navMenu.contains(event.target) || (navToggle && navToggle.contains(event.target));
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            dropdowns.forEach(dropdown => {
                const content = dropdown.querySelector('.dropdown-content');
                if (content) content.classList.remove('active');
            });
        }
    });

    // Initialize calendars
    initializeCalendars();

    // Carousel functionality
    const carousel = document.querySelector('.carousel');
    const carouselItems = carousel.querySelectorAll('.carousel-item');
    const prevButton = carousel.querySelector('.prev');
    const nextButton = carousel.querySelector('.next');
    let currentIndex = 0;

    function showSlide(index) {
        carouselItems.forEach(item => item.classList.remove('active'));
        carouselItems[index].classList.add('active');
        adjustCarouselImage(carouselItems[index].querySelector('img'));
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

    // Function to adjust carousel image
    function adjustCarouselImage(img) {
        const container = img.closest('.carousel-item');
        const containerAspect = container.offsetWidth / container.offsetHeight;
        const imgAspect = img.naturalWidth / img.naturalHeight;

        if (imgAspect > containerAspect) {
            img.style.width = '100%';
            img.style.height = 'auto';
        } else {
            img.style.width = 'auto';
            img.style.height = '100%';
        }
    }

    // Adjust all carousel images on load and resize
    function adjustAllCarouselImages() {
        carouselItems.forEach(item => {
            const img = item.querySelector('img');
            if (img.complete) {
                adjustCarouselImage(img);
            } else {
                img.addEventListener('load', () => adjustCarouselImage(img));
            }
        });
    }

    window.addEventListener('resize', adjustAllCarouselImages);
    adjustAllCarouselImages();

});
