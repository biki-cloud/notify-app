export const sendNotification = async () => {
  const msg = "テスト通知";
  console.log("[sendNotification] 通知送信開始", { msg });
  if (Notification.permission === "granted") {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        console.log("[sendNotification] ServiceWorker登録取得", reg);
        reg?.showNotification("通知", { body: msg });
        console.log("[sendNotification] showNotification実行", { body: msg });
      });
    } else {
      new Notification("通知", { body: msg });
      console.log("[sendNotification] new Notification実行", { body: msg });
    }
  } else {
    console.log(
      "[sendNotification] Notification.permissionがgrantedではありません",
      Notification.permission
    );
  }
};
