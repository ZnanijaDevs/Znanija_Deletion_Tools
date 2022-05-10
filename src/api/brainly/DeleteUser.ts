import cookies from "js-cookie";

import WaitForPage from "./WaitForPage";

type UserTokensDataType = {
  [x in keyof {"key", "fields", "lock"}]?: string;
}

export type DeleteUserOptionsDataType = {
  answers: boolean;
  tasks: boolean;
  comments: boolean;
  account: boolean;
  reason: string;
}

export default class AccountDeleter {
  private userId: number;
  private formsWithTokens: {
    [key: string]: UserTokensDataType
  } = {};

  private options: DeleteUserOptionsDataType;

  constructor(userId: number, options: DeleteUserOptionsDataType = {
    answers: true,
    tasks: false,
    comments: true,
    account: true,
    reason: ""
  }) {
    this.userId = userId;
    this.options = options;
  }

  async Delete() {
    await this.SetPHPTokens();
    await this.SendForms();
  }

  async SetPHPTokens() {
    const isBrainly = /brainly/.test(window.location.href);

    const doc = await WaitForPage(
      `/${isBrainly ? "profile" : "profil"}/__nick__-${this.userId}`
    );

    const forms: NodeListOf<HTMLFormElement> = doc.querySelectorAll(`form[action*="/admin/users/delete"]`);
    for (const form of forms) {
      const formAction = form.action.replace(/.+\.com/, "");
      const tokenSelectors = form.querySelectorAll(`input[name*="data[_Token]"]`);

      const formTokens = {};

      tokenSelectors.forEach((selector: HTMLInputElement) => {
        const tokenName = selector.name.replace(/.+\[/, "").replace("]", "");

        formTokens[tokenName] = selector.value;
      });

      this.formsWithTokens[formAction] = formTokens;
    }
  }

  async Send(path: string, data?) {
    const formTokens = this.formsWithTokens[path];
    if (!formTokens) 
      throw Error("Не удалось найти форму удаления пользователя");

    const form = new FormData();

    const formData = {
      _method: "POST",
      "data[_Token][key]": formTokens.key,
      "data[_Token][fields]": formTokens.fields,
      "data[_Token][lock]": formTokens.lock,
      ...data
    };

    if (!/\d+$/.test(path)) formData["data[uid]"] = this.userId;

    for (const key in formData) {
      form.append(key, formData[key]);
    }

    await fetch(`${path}?client=moderator-extension`, {
      method: "POST",
      credentials: "include",
      redirect: "manual",
      body: form,
      headers: {
        "X-Extension-Used": "Znanija_Deletion_Tools"
      }
    });

    this.FindError();
  }

  async SendForms() {
    const userId = this.userId;
    const options = this.options;
    
    if (options.tasks) await this.Send("/admin/users/delete_tasks");
    if (options.answers) await this.Send("/admin/users/delete_responses");
    if (options.comments) await this.Send("/admin/users/delete_comments");

    if (options.account) 
      await this.Send(`/admin/users/delete/${userId}`, {
        "data[DelUser][reason]": options.reason,
        "data[DelUser][delResponses]": 0,
        "data[DelUser][delTasks]": 0,
        "data[DelUser][delComments]": 0
      });

    this.Log();
  }

  private FindError() {
    const infoBarData = cookies.get("Zadanepl_cookie[infobar]");
    if (!infoBarData) throw Error("Непредвиденная ошибка");

    const notifications: {
      class: string;
      layout: string;
      text: string;
    }[] = JSON.parse(atob(unescape(infoBarData)));

    for (const notification of notifications) {
      console.info("Deletion result", notification);

      if (notification?.class === "failure") 
        throw Error(`Ошибка: ${notification.text}`);
    }

    cookies.remove("Zadanepl_cookie[infobar]");
  }

  private Log() {
    navigator.sendBeacon(`https://helpbot.br-helper.com/delete_user/${this.userId}`);
  }
}