document.addEventListener('DOMContentLoaded', async () => {
    const calendarEl = document.getElementById('full-calendar-container');

    try {
        // Fetch the configuration from the API endpoint
        const response = await fetch('/api/config');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const config = await response.json();

        const msalConfig = {
            auth: {
                clientId: config.CLIENT_ID,
                authority: config.AUTHORITY,
                redirectUri: window.location.origin + "/calendar.html",
            },
            cache: {
                cacheLocation: "localStorage",
                storeAuthStateInCookie: true,
            },
        };

        const msalInstance = new msal.PublicClientApplication(msalConfig);
        let interactionInProgress = false;

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

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

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
    } catch (error) {
        console.error('Error fetching configuration', error);
    }
});
