import BrainlyApi from "@api/brainly";
import storage from "@utils/storage";

export default async (): Promise<string> => {
  const savedAccessKey = await storage.get("accessKey");
  if (savedAccessKey) return savedAccessKey;

  const BOT_ID = 26831100;

  const conversation = await BrainlyApi.GetDM(BOT_ID);
  const messageWithAccessKey = conversation.messages
    .reverse()
    .find(message =>
      /удалятор spamouts/i.test(message.content)
    );
    
  if (!messageWithAccessKey) throw Error("Access key not found in DM");

  const accessKey = messageWithAccessKey.content
    .replace(/.+\[/, "")
    .replace("]", "");

  await storage.set({
    accessKey
  });

  return accessKey;
};