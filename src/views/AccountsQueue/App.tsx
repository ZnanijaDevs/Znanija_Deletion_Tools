import React from "react";
import { runtime } from "webextension-polyfill";
import { Flex, TextBit, Spinner } from "brainly-style-guide";

import LiveWebSocket from "@api/extension/ws";
import type { Message, ActiveUser } from "@typings";

import ActiveUsers from "./components/ActiveUsers";
import QueueItem from "./components/QueueItem";
import ErrorContainer from "./components/ErrorContainer";

type AppStateDataType = {
  queue: Message[];
  error: string;
  activeUsers: ActiveUser[];
  connected: boolean;
}

export default class App extends React.Component {
  state: AppStateDataType = {
    queue: [],
    error: "",
    activeUsers: [],
    connected: false
  };

  componentDidMount() {
    this.OpenConnection();
  }

  async OpenConnection() {
    const ws = await new LiveWebSocket().Open();

    ws
      .onClose(reason => 
        this.setState({
          error: reason,
          connected: false
        })
      )
      .onEvent("hello_there", _ =>
        this.setState({ connected: true })
      )
      .onEvent("messages_updated", data => 
        this.setState({ queue: data.messages })
      )
      .onEvent("users_updated", users =>
        this.setState({ activeUsers: users })
      );
  }

  render() {
    const { error, connected, queue, activeUsers } = this.state;

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
}