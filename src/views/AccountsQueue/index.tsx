import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

document.title = "Аккаунты на удаление";

// Clean flash messages
for (const flash of document.querySelectorAll(".flash-messages-container .sg-flash")) {
  flash.remove();
}

const root = document.querySelector(".js-main-container");
root.innerHTML = "";

createRoot(root).render(<App />);