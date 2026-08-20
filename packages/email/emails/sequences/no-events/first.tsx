import { Button, Section, Text } from '@react-email/components';
import { BaseTemplate, buttonStyle, textStyle, anchorStyle } from '../../base-template';

interface Props {
  userName?: string | null;
  projectId: string;
  projectName: string;
  unsubscribeLink: string;
}

export const NoEventsFirstMail = ({ userName, projectName, unsubscribeLink }: Props) => {
  const greeting = userName ? `Hey ${userName}` : 'Hey there';

  return (
    <BaseTemplate previewText="Checkout the available installation guides" unsubscribeLink={unsubscribeLink}>
      <Section>
        <Text style={textStyle}>{greeting},</Text>
        <Text style={textStyle}>
          I noticed you created a project for <strong>{projectName}</strong> in Insight.info, but haven't started tracking
          events yet.
        </Text>
        <Text style={textStyle}>
          I'd love to help you get your analytics up and running. I've already prepared a bunch of{' '}
          <a
            href={`https://insight.info/docs/installation?utm_campaign=no-events&utm_content=first`}
            style={anchorStyle}
          >
            installation guides
          </a>{' '}
          for various applications and frameworks to get you started quickly.
        </Text>
        <Text style={textStyle}>Most integrations take less than 5 minutes to set up!</Text>
        <Text style={textStyle}>
          <strong>🛠️ Need help?</strong> Feel free to reply to this email – I'm happy to help you get started!
        </Text>
        <Button
          style={buttonStyle}
          href={`https://insight.info/docs/installation?utm_campaign=no-events&utm_content=first`}
        >
          View Setup Guide
        </Button>
        <Text style={textStyle}>Looking forward to seeing your first events come through!</Text>
      </Section>
    </BaseTemplate>
  );
};

NoEventsFirstMail.PreviewProps = {
  userName: 'John',
  projectName: 'snappify',
  unsubscribeLink: 'https://insight.info/_api/email/unsubscribe?token=123',
} as Props;

export default NoEventsFirstMail;
