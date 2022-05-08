import { Headline, Text } from "brainly-style-guide";
import { runtime } from "webextension-polyfill";

export default function ErrorContainer(props: {
  error: string
}) {
  return (
    <div className="error-container">
      <img height="215" draggable="false" src={runtime.getURL("sad_duck.gif")} />
      <Headline color="text-red-60" extraBold type="h3">
        Случилась ошибка! Наши утки-программисты уже занимаются этим
      </Headline>
      <Text weight="bold" color="text-gray-70" align="to-center">{props.error}</Text>
    </div>
  );
}