const msalConfig = {
    auth: {
        clientId: "A608Q~~dgKVm5Zu4aQPjmyCM5LLo4~I7QRH0Tcd1",
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
                const accounts = msalInstance.getAllAccounts();
                if (accounts.length === 0) {
                    msalInstance.loginRedirect({
                        scopes: ["Calendars.Read"]
                    });
                    return;
                }

                const account = accounts[0];
                const tokenResponse = await msalInstance.acquireTokenSilent({
                    scopes: ["Calendars.Read"],
                    account: account
                });

                if (!tokenResponse) {
                    throw new Error("Token response is undefined");
                }

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
