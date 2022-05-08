import browser from "webextension-polyfill";

const ACCOUNTS_QUEUE_LINK = "https://znanija.com/question/add?todelete-queue";
browser.action.onClicked.addListener(_ => {
  browser.tabs.create({ url: ACCOUNTS_QUEUE_LINK });
});