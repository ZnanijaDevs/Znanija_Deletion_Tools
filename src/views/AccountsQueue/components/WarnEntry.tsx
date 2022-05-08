import { Flex, Text, Link } from "brainly-style-guide";

import type { UserWarnDataType } from "@typings/brainly";
import BeautifyDeletionReason from "@utils/BeautifyDeletionReason";

export default function WarnEntry(props: {
  warn: UserWarnDataType
}) {
  const warn = props.warn;

  return (
    <div className="warn-entry">
      <Text size="small" className="warn-content" dangerouslySetInnerHTML={{
        __html: warn.content
      }} />
      <Flex direction="column" marginRight="xxs">
        <Link target="_blank" href={`/task/${warn.taskId}`} size="small" weight="bold" title={warn.reason} style={{ lineHeight: 1 }}>
          {BeautifyDeletionReason(warn.reason)}
        </Link>
        <Text size="xsmall" weight="bold" color="text-blue-60">
          {warn.warner}
        </Text>
        <Text size="xsmall" color="text-gray-70">
          {warn.time}
        </Text>
      </Flex>
    </div>
  );
}