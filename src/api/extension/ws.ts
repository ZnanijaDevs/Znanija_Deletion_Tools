import type { 
  ActiveUser,
  HelloEvent, 
  Message, 
  MessageDeletedEvent,
  UsersUpdatedEvent,
  WebSocketEvent, 
  WebSocketEventName 
} from "typings";
import GetAccessKey from "./GetAccessKey";

type EventListenerFunctionDataType<N> = 
  N extends "hello_there" ? (messages: HelloEvent["messages"]) => void : 
  N extends "message_deleted" ? (timestamp: MessageDeletedEvent["message_ts"]) => void :
  N extends "messages_updated" ? (data: {
    messages: Message[];
    count: number;
  }) => void :
  N extends "users_updated" ? (users: ActiveUser[]) => void :
  (...args) => void;

export default class LiveWebSocket {
  private wsServerUrl = "wss://todelete-live.br-helper.com/v1/events";
  private ws: WebSocket;
  
  private eventListeners: {
    [T in WebSocketEventName | "users_updated" | "messages_updated"]?: EventListenerFunctionDataType<T>;
  } = {};

  private messages: Message[] = [];

  /** Open a WebSocket connection */
  async Open() {
    const accessKey = await GetAccessKey();

    const ws = new WebSocket(`${this.wsServerUrl}?accessKey=${accessKey}`);

    ws.onopen = _ => {
      console.debug("Connected to the extension server", {
        url: this.wsServerUrl,
        socket: this.ws,
      });

      ws.onmessage = message =>
        this.IdentifyMessage(JSON.parse(message.data));
    };

    this.ws = ws;

    return this;
  }

  /** Close the WebSocket connection */
  Close(reason = "") {
    this.ws.close(1000, reason);
  }

  IdentifyMessage(message: WebSocketEvent) {
    if (message.event === "users_updated") {
      const usersData = message.data as UsersUpdatedEvent;
      this.eventListeners["users_updated"]?.(usersData.users);
  
      return;
    }
  
    if (message.event === "hello_there") {
      const eventData = message.data as HelloEvent;

      this.messages = eventData.messages.items;

      this.eventListeners["hello_there"]?.(eventData.messages);
    } else if (message.event === "new_message") {
      const newMessage = message.data as Message;
      this.messages.unshift(newMessage);
    } else if (message.event === "message_deleted") {
      const deletedMessageTs = (message.data as MessageDeletedEvent).message_ts;

      this.messages = this.messages.filter(message => message.message.ts !== deletedMessageTs);
    }

    this.eventListeners["messages_updated"]?.({
      messages: this.messages,
      count: this.messages.length
    });
  }

  // WebSocket listeners
  onClose(callback: (reason: string) => void) {
    this.ws.onclose = (closeEvent) => {
      const DEFAULT_CLOSE_EVENT_REASON = "Соединение закрыто";
    
      callback(closeEvent.reason || DEFAULT_CLOSE_EVENT_REASON);
      console.warn("WebSocket closed", closeEvent);
    };

    return this;
  }

  onEvent<
    N extends WebSocketEventName | "messages_updated" | "users_updated"
  >(name: N, callback: EventListenerFunctionDataType<N>) {
    if (this.eventListeners[name]) return;
  
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.eventListeners[name] = callback;

    return this;
  }

}