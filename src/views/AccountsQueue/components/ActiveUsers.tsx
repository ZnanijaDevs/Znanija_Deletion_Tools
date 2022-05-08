import { Flex, Avatar } from "brainly-style-guide";
import type { ActiveUser } from "@typings";

export default function ActiveUsers(props: {
  users: ActiveUser[];
}) {
  return (
    <Flex className="queue__header--active-users">
      {props.users.map(user => 
        <Avatar title={user.nick} key={user.nick} imgSrc={user.avatar} />
      )}
    </Flex>
  );
}