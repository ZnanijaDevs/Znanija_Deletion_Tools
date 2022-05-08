export default (
  type: "info" | "error" | "success" | "default",
  text: string
) => {
  const element = document.createElement("div");

  element.classList.add("sg-flash");
  element.innerHTML = `
    <div class="sg-flash__message sg-flash__message--${type}">
      <div class="sg-text sg-text--small sg-text--bold sg-text--to-center">
        ${text}
      </div>
    </div>
  `;

  element.onclick = () => element.remove();
  setTimeout(() => element.remove(), 6000);

  const flashesContainer = document.querySelector(".flash-messages-container");
  if (!flashesContainer) throw Error("Flashes container not found");

  flashesContainer.append(element);
};