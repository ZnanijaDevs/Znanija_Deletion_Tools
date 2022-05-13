import WaitForPage from "./WaitForPage";
import type { 
  UserDataType, 
  UserWarnDataType, 
  UserActiveBanDetailsDataType 
} from "@typings/brainly";

export default new class BrainlyApi {
  private apiPath = "https://znanija.com/api/28";

  private async Request<T>(
    method: "GET" | "POST",
    apiMethod: string,
    body?
  ): Promise<T> {
    const data = await fetch(`${this.apiPath}/${apiMethod}`, {
      method,
      body: method === "GET" ? null : JSON.stringify(body)
    })
      .then(data => data.json());

    if (!data.success) throw Error(data.message);

    return data.data;
  }

  async GetDM(userId: number): Promise<{
    conversation: {
      id: number;
      user_id: number;
      created: string;
      recipient_id: number;
      allow_link_from: unknown[];
    };
    last_id: number;
    messages: {
      id: number;
      conversation_id: number;
      user_id: number;
      created: string;
      content: string;
      is_harmful: boolean;
      new: boolean;
    }[];
  }> {
    const conversation: {
      conversation_id: number
    } = await this.Request("POST", "api_messages/check", {
      user_id: userId
    });

    return await this.Request("GET", `api_messages/get_messages/${conversation.conversation_id}`);
  }

  async GetUserWarnings(userId: number) {
    const warnsPage = await WaitForPage(`/users/view_user_warns/${userId}`);

    const rows = warnsPage.querySelectorAll("tr:not(:first-child)");
    
    return [...rows].map(row => {
      const fields = row.querySelectorAll("td");
      if (fields.length !== 7) return;
  
      const warn = {} as UserWarnDataType;
      warn.time = fields[0].innerText;
      warn.reason = fields[1].innerHTML;
      warn.content = fields[2].innerHTML;
      warn.taskId = Number(fields[3].querySelector("a")?.href.match(/\d+/)[0]);
      warn.warner = fields[4].innerText.trim();
      warn.active = !!fields[5].querySelector(`a[href*="cancel"]`);
        
      return warn;
    });
  }

  async GetUserContent(userId: number, type: "tasks" | "answers" | "comments") {
    const contentType = {
      "tasks": "tasks",
      "answers": "responses",
      "comments": "comments_tr"
    }[type];
  
    const page = await WaitForPage(`/users/user_content/${userId}/${contentType}`);

    return [...page.querySelectorAll("table > tbody > tr")].map(row => {
      const dateSelector = row.querySelector("td:last-child");

      return {
        content: row.querySelector("a").innerText.trim(),
        taskLink: row.querySelector("a").href,
        date: dateSelector.textContent,
        subject: dateSelector.previousElementSibling.textContent
      };
    });
  }

  async GetUser(userId: number) {
    const [profilePage, warns] = await Promise.all([
      WaitForPage(`/profil/__nick__-${userId}`),
      this.GetUserWarnings(userId)
    ]);
  
    const user = {
      warns,
      activeBan: null
    } as UserDataType;
  
    const userInfoHeader = profilePage.querySelector(".header .info_top");
    const avatarImg: HTMLImageElement = profilePage.querySelector(".personal_info .avatar img");
  
    user.nick = userInfoHeader.querySelector("a").textContent;
    user.points = +userInfoHeader.querySelector(".points > h1").textContent.replace(" ", "");
    user.avatar = /static/.test(avatarImg.src) ? avatarImg.src : "/img/avatars/100-ON.png";
    user.ranks = [...userInfoHeader.querySelectorAll(".rank h3 a")].map(el => 
      el.textContent
    );
  
    user.presence = userInfoHeader.querySelector(".rank > span").textContent
      .replace(/\r?\n/g, "")
      .replace(/<g>/g,"")
      .replace(/Активн(ая|ый)/, "офлайн: ")
      .replace(/тому/, "")
      .trim();
  
    user.bansCount = Number(
      profilePage.querySelector(".mod-profile-panel").textContent.match(/(?<=Баны:\s)\d+/)
    );
  
    // Get user ban details
    const cancelBanLink = profilePage.querySelector(`a[href^="/bans/cancel"]`);
    if (cancelBanLink) {
      const banDetails = {} as UserActiveBanDetailsDataType;
      const liElement = cancelBanLink?.parentElement?.parentElement;
  
      banDetails.type = liElement.nextElementSibling
        ?.querySelector(".orange")
        ?.textContent;
  
      const moderatorLink = liElement.nextElementSibling
        ?.nextElementSibling
        ?.querySelector("a");
  
      banDetails.givenBy = {
        link: moderatorLink.href,
        nick: moderatorLink.textContent,
      };
  
      const expiresDateText = liElement.nextElementSibling
        ?.nextElementSibling?.nextElementSibling
        ?.querySelector(".orange")
        ?.textContent;
  
      if (expiresDateText) banDetails.expiresIn = expiresDateText;
  
      user.activeBan = banDetails;
    }
  
    return user;
  }

}();