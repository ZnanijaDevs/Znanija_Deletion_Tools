import type { 
  UserDataType, 
  UserWarnDataType, 
  UserActiveBanDetailsDataType 
} from "@typings/brainly";

const WaitForPage = async (path: string) => {
  const r = await fetch(path);

  if (r.status === 410) throw Error("Пользователь удалён");

  const text = await r.text();
  
  return new DOMParser().parseFromString(text, "text/html");
};

export default async function GetUser(id: number) {
  const [profilePage, warnsPage] = await Promise.all([
    WaitForPage(`/profil/__nick__-${id}`),
    WaitForPage(`/users/view_user_warns/${id}`)
  ]);

  const user = {
    warns: [],
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

  // Get user warnings
  warnsPage.querySelectorAll("tr:not(:first-child)").forEach(row => {
    const fields = row.querySelectorAll("td");
    if (fields.length !== 7) return;

    const warn = {} as UserWarnDataType;
    warn.time = fields[0].innerText;
    warn.reason = fields[1].innerHTML;
    warn.content = fields[2].innerHTML;
    warn.taskId = Number(fields[3].querySelector("a")?.href.match(/\d+/)[0]);
    warn.warner = fields[4].innerText.trim();
    warn.active = !!fields[5].querySelector(`a[href*="cancel"]`);
      
    user.warns.push(warn);
  });

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