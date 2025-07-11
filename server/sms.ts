import twilio from 'twilio';

export async function sendScamReportSMS(phoneNumber: string, scamType: string, description?: string): Promise<void> {
  try {
    console.log('Attempting to send SMS notification...');
    console.log('TWILIO_ACCOUNT_SID exists:', !!process.env.TWILIO_ACCOUNT_SID);
    console.log('TWILIO_AUTH_TOKEN exists:', !!process.env.TWILIO_AUTH_TOKEN);
    console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER);
    
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const message = `🚨 NEW SCAM REPORT
Phone: ${phoneNumber}
Type: ${scamType}
${description ? `Details: ${description}` : ''}
Time: ${new Date().toLocaleString()}

Report logged in Packie AI system.`;

    // Only send SMS if a notification number is configured
    if (!process.env.NOTIFICATION_PHONE_NUMBER) {
      console.log('No notification phone number configured, skipping SMS');
      return;
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.NOTIFICATION_PHONE_NUMBER
    });

    console.log(`✅ SMS notification sent successfully! SID: ${result.sid}`);
  } catch (error) {
    console.error('❌ Failed to send SMS notification:');
    console.error('Error details:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    // Don't throw error to prevent blocking the report submission
  }
}