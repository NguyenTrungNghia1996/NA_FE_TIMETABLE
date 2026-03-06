import { message, notification } from "ant-design-vue";

export default defineNuxtPlugin(() => {
  // Prevent Ant Design Vue message and notification from crashing during SSR
  // by mocking all their methods with a no-op function on the server side.
  const noop = () => { };

  if (message) {
    const msg = message as any;
    ["success", "error", "info", "warning", "warn", "loading", "destroy"].forEach((method) => {
      msg[method] = noop;
    });
  }

  if (notification) {
    const notif = notification as any;
    ["success", "error", "info", "warning", "open", "close", "destroy"].forEach((method) => {
      notif[method] = noop;
    });
  }
});
