import { useEffect, useState } from "react";
import { Spinner, Text, Flex, Avatar, Link, Icon, Headline } from "brainly-style-guide";

import GetUser from "@api/brainly/GetUser";
import type { UserDataType } from "@typings/brainly";
import WarnEntry from "./WarnEntry";

export default function UserPreview(props: { userId: number }) {
  const [user, setUser] = useState<UserDataType>(null);

  useEffect(() => {
    GetUser(props.userId)
      .then(user => setUser(user));
  }, []);

  if (!user) return <Flex justifyContent="center"><Spinner size="xsmall" /></Flex>;

  return (
    <Flex direction="column" className="queue-item__user-preview">
      <Flex alignItems="center">
        <Avatar size="s" imgSrc={user.avatar} />
        <Flex direction="column" marginLeft="xs">
          <Flex alignItems="center">
            <Link target="_blank" href={`/users/redirect_user/${props.userId}`}>{user.nick}</Link>
            <Text size="small" weight="bold" className="sg-flex--margin-left-xs">{user.ranks?.[0]}</Text>
          </Flex>
          <Text size="small" weight="bold" className="user-presence" color={
            `text-${/онлайн/.test(user.presence) ? "green" : "red"}-60`
          }>
            {user.presence}
          </Text>
        </Flex>
        <div className="sg-counter sg-counter--with-icon">
          <Flex className="sg-counter__icon-container">
            <Icon size={24} className="sg-counter__icon" color="icon-black" type="points" />
          </Flex>
          <Flex alignItems="center">
            <Text size="small" weight="bold" className="sg-counter__text">{user.points}</Text>
          </Flex>
        </div>
      </Flex>
      {user.activeBan && <Text size="small" align="to-center" className="user-ban-line">
        Бан <b>{user.activeBan.type}</b>. Выдан <b>{user.activeBan.givenBy.nick}</b>
      </Text>}
      <Flex justifyContent="space-between" marginTop="s">
        <Headline extraBold size="small" transform="uppercase">
          Предупреждения ({user.warns.length})
        </Headline>
        <Text size="small">Баны: <b>{user.bansCount}</b></Text>
      </Flex>
      <Flex direction="column" className="queue-item__user-warnings">
        {user.warns.map((warn, i) =>
          <WarnEntry warn={warn} key={i} />
        )}
      </Flex>
    </Flex>
  );
}