self.addEventListener("push", function (event) {
  if (event.data) {
    const message = event.data.text();
    const options = {
      body: message,
      icon: "/favicon.svg", // Use our favicon
      badge: "/favicon.svg",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
    };
    event.waitUntil(self.registration.showNotification("LifeHub", options));
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
