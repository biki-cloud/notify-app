self.addEventListener("push", function (event) {
  const data = event.data
    ? event.data.json()
    : { title: "通知", body: "メッセージがあります" };
  event.waitUntil(
    self.registration.showNotification(data.title || "通知", {
      body: data.body || "メッセージがあります",
      icon: "/icons/icon-192x192.png",
    })
  );
});
