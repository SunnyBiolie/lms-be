import cron from "node-cron";

declare global {
  var cronJobGlobal: cron.ScheduledTask | undefined;
}

// Kiểm tra xem cron job đã tồn tại hay chưa
const cronJob =
  globalThis.cronJobGlobal ||
  cron.schedule("*/* * * * *", () => {
    console.log("Cron job is running every minute");
  });

// Đảm bảo cron job chỉ được tạo một lần trong quá trình phát triển
if (process.env.NODE_ENV !== "production") {
  globalThis.cronJobGlobal = cronJob;
}

export default cronJob;
