export type WebSocketEventName = 
  | "hello_there"
  | "users_updated"
  | "message_deleted"
  | "new_message";

export interface ActiveUser {
  nick: string;
  avatar: string;
}

export interface UsersUpdatedEvent {
  users: ActiveUser[];
}

export interface HelloEvent {
  messages: {
    count: number;
    items: Message[];
  }
}

export interface MessageDeletedEvent {
  message_ts: string;
}

export interface Message {
  sent_by: string;
  reason: string;
  link: string;
  note: string;
  message: {
    text: string;
    ts: string;
  };
  sender: {
    id: string;
    team_id: string;
    nick: string;
    avatar: string;
  };
  user: {
    id: string;
    database_id: number;
    nick: string;
    rank: string;
    points: number;
    answers_count: number;
    avatar: string;
    thanks_count: number;
    created: string;
    helped_users_count: number;
  }
}

export type WebSocketEvent<T extends WebSocketEventName = WebSocketEventName> = {
  debug: boolean;
  timestamp: number;
  event: T;
  data: 
    T extends "users_updated" ? UsersUpdatedEvent :
    T extends "message_deleted" ? MessageDeletedEvent :
    T extends "new_message" ? Message :
    T extends "hello_there" ? HelloEvent : 
    null;
}