import { useState, useEffect } from "react";
import { Flex, Spinner, Link, Headline, Text } from "brainly-style-guide";
import _API from "@api/brainly";

type UserContentItems = {
  content: string;
  taskLink: string;
  date: string;
  subject: string;
}[];

type UserContentType = "answers" | "tasks" | "comments";

const BEAUTIFIED_CONTENT_TYPES = {
  "answers": "Ответы",
  "tasks": "Вопросы",
  "comments": "Комментарии"
};

export default function UserContentPreview(props: { userId: number }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<UserContentItems>([]);
  const [type, setType] = useState<UserContentType>("answers");

  useEffect(() => {
    _API.GetUserContent(props.userId, type)
      .then(items => {
        setItems(items);
        setLoading(false);
      });
  }, [type]);

  if (loading) return (<Flex justifyContent="center">
    <Spinner size="xsmall" />
  </Flex>);

  return (
    <Flex direction="column">
      <Flex justifyContent="space-between" alignItems="center">
        <Headline extraBold color="text-blue-60">
          {BEAUTIFIED_CONTENT_TYPES[type]}
        </Headline>
        <Flex marginLeft="l">
          {Object.keys(BEAUTIFIED_CONTENT_TYPES).map((contentType: UserContentType) => 
            <Text 
              className="sg-cursor-pointer sg-flex--margin-left-xs" 
              onClick={() => setType(contentType)} 
              size="small" 
              weight="bold" 
              key={contentType}
              color={type === contentType ? "text-red-60" : "text-black"}
            >
              {BEAUTIFIED_CONTENT_TYPES[contentType]}
            </Text>
          )}
        </Flex>
      </Flex>
      {!items?.length ? 
        <Flex marginTop="s" justifyContent="center">
          <Text size="small" weight="bold">Здесь ничего нет ¯\_(ツ)_/¯</Text>
        </Flex> : 
        items.map((item, i) =>
          <div key={i} className="queue-item__user-content-list-item">
            <Link key={i} target="_blank" href={item.taskLink} size="small">
              {item.content}
            </Link>
            <Text size="xsmall" weight="bold">{item.subject}</Text>
            <Text size="xsmall" color="text-gray-70">{item.date}</Text>
          </div>
        )
      }
    </Flex>
  );
}