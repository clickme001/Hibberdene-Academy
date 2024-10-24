// calendar.js (rewritten)

import { PublicClientApplication } from '@microsoft/msal-browser';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

document.addEventListener('DOMContentLoaded', async () => {
  const calendarEl = document.getElementById('full-calendar-container');

  try {
    // Fetch the configuration from the API endpoint
    const response = await fetch('/api/config/msal');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const config = await response.json();

    // Initialize MSAL
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
    const msalInstance = new PublicClientApplication(msalConfig);

    // Handle authentication
    const accounts = msalInstance.getAllAccounts();
    let interactionInProgress = false;

    const handleLogin = async () => {
      if (!interactionInProgress) {
        interactionInProgress = true;
        await msalInstance.loginRedirect({
          scopes: ["Calendars.Read"],
        });
      }
    };

    const handleLogout = async () => {
      await msalInstance.logout();
      window.location.reload();
    };

    // Render FullCalendar
    const calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      events: async function (fetchInfo, successCallback, failureCallback) {
        try {
          if (!accounts || accounts.length === 0) {
            handleLogin();
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

    // Add event listeners for login/logout buttons (if present)
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');

    if (loginButton) {
      loginButton.addEventListener('click', handleLogin);
    }

    if (logoutButton) {
      logoutButton.addEventListener('click', handleLogout);
    }
  } catch (error) {
    console.error('Error initializing calendar', error);
  }
});
