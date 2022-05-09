import React, { useState } from "react";
import { Flex, Checkbox, Button, Textarea } from "brainly-style-guide";

import AccountDeleter, { DeleteUserOptionsDataType } from "@api/brainly/DeleteUser";
import Flash from "@utils/Flashes";

const DELETION_TYPES = [{ 
  type: "account", 
  text: "Аккаунт" 
}, { 
  type: "answers", 
  text: "Ответы" 
}, { 
  type: "tasks", 
  text: "Задания" 
}, { 
  type: "comments", 
  text: "Комментарии" 
}];

const DELETION_REASONS = [{
  text: "Мы вынуждены удалить ваш аккаунт в связи с систематическим нарушением правил сайта.",
  type: "Лимит"
}, {
  text: "Ваш аккаунт был удалён за оскорбление пользователей сообщества.",
  type: "Оскорбления"
}, {
  text: "Аккаунт удален по желанию Пользователя",
  type: "Желание"
}, {
  text: "Ники, подобные Вашему, недопустимы на образовательном сайте. Мы вынуждены удалить Ваш аккаунт.",
  type: "Ник"
}, {
  text: "Ваш аккаунт был удалён за размещение недопустимого на образовательном сайте контента.",
  type: "Контент"
}, {
  text: "За троллинг",
  type: "Троллинг"
}];

export default function DeletUserTooltip(props: {
  userId: number;
}) {
  const [deletionOptions, setDeletionOptions] = useState<DeleteUserOptionsDataType>({
    account: true,
    answers: true,
    comments: true,
    tasks: false,
    reason: "Мы вынуждены удалить ваш аккаунт в связи с систематическим нарушением правил сайта."
  });
  const [loading, setLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const deleteUser = () => {
    setLoading(true);

    new AccountDeleter(props.userId, deletionOptions).Delete()
      .then(() => setDeleted(true))
      .catch(err => Flash("default", err.message))
      .finally(() => setLoading(false));
  };

  const setDeletionReason = (reason: string) => {
    setDeletionOptions(prev => ({ ...prev, reason }));
  };

  return (
    <Flex direction="column" hidden={deleted} className="queue-item__delete-user-tooltip">
      <Flex>
        {DELETION_TYPES.map(x =>
          <Checkbox disabled={loading} key={x.type} defaultChecked={x.type !== "tasks"} onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
            setDeletionOptions(prev => ({ ...prev, [x.type]: event.target.checked }))
          }>
            {x.text}
          </Checkbox>
        )}
      </Flex>
      <Textarea 
        onChange={(event: React.FormEvent<HTMLTextAreaElement>) => 
          setDeletionReason(event.currentTarget.value)
        } 
        placeholder="Причина удаления" 
        value={deletionOptions.reason} 
        size="tall" 
      />
      <Flex justifyContent="space-between">
        <Flex>
          {DELETION_REASONS.map(reason => 
            <Button onClick={_ => setDeletionReason(reason.text)} title={reason.text} key={reason.type} type="transparent" size="s">
              {reason.type.charAt(0)}
            </Button>
          )}
        </Flex>
        <Button onClick={deleteUser} size="s" type="solid" loading={loading}>Удалить</Button>
      </Flex>
    </Flex>
  );
}