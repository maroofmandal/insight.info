import { Button, Section, Text } from '@react-email/components';
import { BaseTemplate, buttonStyle, textStyle } from './base-template';

interface Props {
  firstName: string;
  resetLink: string;
}

export const PasswordResetMail = ({ firstName, resetLink }: Props) => {
  return (
    <BaseTemplate previewText="Someone requested a password change for your Insight.info account.">
      <Section>
        <Text style={textStyle}>Hey {firstName},</Text>
        <Text style={textStyle}>
          Someone requested a password change for your Insight.info account. If this was you, you can set a new password
          here:
        </Text>
        <Button style={buttonStyle} href={resetLink}>
          Reset password
        </Button>
        <Text style={textStyle}>
          If you don&apos;t want to change your password or didn&apos;t request this, just ignore and delete this
          message.
        </Text>
        <Text style={textStyle}>Please don&apos;t forward this email to anyone.</Text>
      </Section>
    </BaseTemplate>
  );
};

PasswordResetMail.PreviewProps = {
  firstName: 'John',
  resetLink: 'https://insight.info',
} as Props;

export default PasswordResetMail;
