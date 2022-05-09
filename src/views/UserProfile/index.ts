import sendForm from "./sendForm";

class AccountDeleter {
  private delUserForm: HTMLFormElement;
  private delUserPanel: HTMLDivElement;

  constructor() {
    this.FindForm();
    this.PrepareDeletionPanel();
    this.AppendDeletionPanel();

    const deleteUserButton: HTMLButtonElement = this.delUserPanel.querySelector("#DeleteUserButton");
    deleteUserButton.onclick = this.Delete.bind(this);
  }

  FindForm() {
    const deleteForm = document.forms["DelUserAddForm"];
    if (!deleteForm) throw Error("The deletion form does not exist on this page");

    this.delUserForm = deleteForm;
  }

  PrepareDeletionPanel() {
    const panel = document.createElement("div");

    panel.id = "DeleteUserPanel";

    panel.innerHTML = `
      <div class="${panel.id}-row">
        <div class="DeleteUserPanel__button-active">Аккаунт</div>
        <div>Задачи</div>
        <div class="DeleteUserPanel__button-active">Решения</div>
        <div class="DeleteUserPanel__button-active">Комментарии</div>
        <button id="DeleteUserButton">Удалить!</button>
      </div>
      <div class="${panel.id}-row">
        <div data-reason="Ваш аккаунт был удалён за оскорбление пользователей сообщества.">Оскорбление</div>
        <div class="DeleteUserPanel__button-active" data-reason="Мы вынуждены удалить ваш аккаунт в связи с систематическим нарушением правил сайта.">Лимит</div>
        <div data-reason="Аккаунт удален по желанию Пользователя">Желание</div>
        <div data-reason="Ники, подобные Вашему, недопустимы на образовательном сайте. Мы вынуждены удалить Ваш аккаунт.">Ник</div>
        <div data-reason="Ваш аккаунт был удалён за размещение недопустимого на образовательном сайте контента.">Контент</div>
        <div data-reason="За троллинг">Троллинг</div>
      </div>
      <textarea placeholder="Причина удаления пользователя" class="${panel.id}-reason" value="Мы вынуждены удалить ваш аккаунт в связи с систематическим нарушением правил сайта">Мы вынуждены удалить ваш аккаунт в связи с систематическим нарушением правил сайта</textarea>
    `;

    // Button listeners
    const buttons: NodeListOf<HTMLDivElement> = panel.querySelectorAll("#DeleteUserPanel > div > div");

    buttons.forEach(btn => {
      btn.onclick = () => {
        const activeClass = `${panel.id}__button-active`;

        if (btn.dataset.reason) {
          btn.parentNode.querySelectorAll("div")
            .forEach(el => el.classList.remove(activeClass));

          panel.querySelector("textarea").value = btn.dataset.reason;
          btn.classList.add(activeClass);
          return;
        } 

        btn.classList.toggle(activeClass);
      };
    });

    this.delUserPanel = panel;
  }

  AppendDeletionPanel() {
    document.querySelector(".mod-profile-panel").insertAdjacentElement(
      "beforebegin", 
      this.delUserPanel
    );
  }

  async Delete(event) {
    const target = event.target;

    if (target.innerHTML === "Удалить!") {
      target.innerHTML = "Точно?";
      return;
    }

    const activeButtons = target.parentNode.querySelectorAll(`div[class*="button-active"]`);
    if (!activeButtons.length) return;

    target.setAttribute("disabled", "true");
    target.innerHTML = "Удаляю";

    const actionsToDo = {};

    activeButtons.forEach(button => {
      actionsToDo[button.textContent.trim()] = true;
    });

    const commentsForm = document.querySelector(`form[action$=delete_comments]`);
    const responsesForm = document.querySelector(`form[action$=delete_responses]`);
    const tasksForm = document.querySelector(`form[action$=delete_tasks]`);
    const userForm = document.querySelector(`form[action*="users/delete/"]`);
                
    if (actionsToDo["Задачи"]) await sendForm(tasksForm);
    if (actionsToDo["Решения"]) await sendForm(responsesForm);
    if (actionsToDo["Комментарии"]) await sendForm(commentsForm);
    if (actionsToDo["Аккаунт"]) {
      const reasonTextarea: HTMLTextAreaElement = userForm.querySelector("#DelUserReason");

      reasonTextarea.value = this.delUserPanel.querySelector("textarea").value;
      await sendForm(userForm);
    }

    target.innerHTML = "Ещё секунда";

    const userId = (
      document.querySelector(`input[name="data[uid]"]`) as HTMLInputElement
    ).value;

    navigator.sendBeacon(`https://helpbot.br-helper.com/delete_user/${userId}`);
    
    window.location.reload();
  }
}

new AccountDeleter();