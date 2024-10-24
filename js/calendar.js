const msalConfig = {
    auth: {
        clientId: window.env.CLIENT_ID,
        authority: window.env.AUTHORITY,
        redirectUri: window.location.origin + "/calendar.html",
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true,
    },
};

const msalInstance = new msal.PublicClientApplication(msalConfig);
let interactionInProgress = false;

document.addEventListener('DOMContentLoaded', () => {
    const calendarEl = document.getElementById('full-calendar-container');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: async function(fetchInfo, successCallback, failureCallback) {
            try {
                const accounts = msalInstance.getAllAccounts();
                if (!accounts || accounts.length === 0) {
                    if (!interactionInProgress) {
                        interactionInProgress = true;
                        msalInstance.loginRedirect({
                            scopes: ["Calendars.Read"]
                        });
                    }
                    return;
                }

                const account = accounts[0];
                const tokenResponse = await msalInstance.acquireTokenSilent({
                    scopes: ["Calendars.Read"],
                    account: account
                }).catch(error => {
                    console.error('Token acquisition failed', error);
                    throw error;
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
            } finally {
                interactionInProgress = false;
            }
        }
    });

    calendar.render();
});
