const msalConfig = {
    auth: {
        clientId: "YOUR_CLIENT_ID",
        authority: "https://login.microsoftonline.com/f2ad13d2-aabc-4b51-bf4b-fecf881d61a6",
        redirectUri: window.location.origin + "/calendar.html",
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true,
    },
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

document.addEventListener('DOMContentLoaded', () => {
    const calendarEl = document.getElementById('full-calendar-container');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: async function(fetchInfo, successCallback, failureCallback) {
            try {
                const account = msalInstance.getAllAccounts()[0];
                if (!account) {
                    msalInstance.loginRedirect({
                        scopes: ["Calendars.Read"]
                    });
                    return;
                }

                const tokenResponse = await msalInstance.acquireTokenSilent({
                    scopes: ["Calendars.Read"],
                    account: account
                });

                const response = await fetch('/api/calendar/events', {
                    headers: {
                        'Authorization': `Bearer ${tokenResponse.accessToken}`
                    }
                });

                const data = await response.json();
                const events = data.value.map(event => ({
                    title: event.subject,
                    start: event.start.dateTime,
                    end: event.end.dateTime
                }));

                successCallback(events);
            } catch (error) {
                console.error('Error fetching events', error);
                failureCallback(error);
            }
        }
    });

    calendar.render();
});
