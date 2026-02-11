import { toPng } from "html-to-image";

export const loadGetUserSnapshotEventListener = () => {
  window.addEventListener("blur", () => {
    toPng(document.body).then((url) => {
      try {
        const allowed = ['http://localhost:3000', 'https://run.gptengineer.app'];
        const origin = window.location.origin;
        if (allowed.includes(origin)) {
          window.top.postMessage({ type: "USER_SNAPSHOT", snapshot: url }, origin);
        }
      } catch (e) {
        // ignore in production
      }
    });
  });
};
