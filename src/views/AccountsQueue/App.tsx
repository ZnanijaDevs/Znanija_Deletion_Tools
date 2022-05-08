import React, { useState, useEffect } from "react";
import { runtime } from "webextension-polyfill";
import { Flex, TextBit, Spinner } from "brainly-style-guide";

import LiveWebSocket from "@api/extension/ws";
import type { Message, ActiveUser } from "@typings";

import ActiveUsers from "./components/ActiveUsers";
import QueueItem from "./components/QueueItem";
import ErrorContainer from "./components/ErrorContainer";

export default function App() {
  const [queue, setQueue] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    new LiveWebSocket().Open().then(ws => {
      ws
        .onClose(reason => {
          setError(reason);
          setConnected(false);
        })
        .onEvent("hello_there", _ => setConnected(true))
        .onEvent("messages_updated", data => setQueue(data.messages))
        .onEvent("users_updated", users => setActiveUsers(users));
    });
  }, []);

  if (error) {
    return <ErrorContainer error={error} />;
  } else if (!connected) {
    return <Spinner />;
  } else if (!queue.length) {
    return <img draggable="false" height="300" title="Нет сообщений" src={runtime.getURL("vzhuh.jpg")} />;
  }

  return (
    <Flex fullWidth fullHeight direction="column">
      <Flex justifyContent="space-between" className="queue__header" alignItems="center">
        <TextBit>#to-delete [{queue.length}]</TextBit>
        <ActiveUsers users={activeUsers} />
      </Flex>
      <Flex direction="column" className="queue__items">
        {queue.map((item, i) => 
          <QueueItem key={i} item={item} />
        )}
      </Flex>
    </Flex>
  );
}