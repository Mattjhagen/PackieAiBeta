import { storage } from "./storage";
import { sendScamReportSMS } from "./sms";
import type { Call, ScamReport, CallRecording } from "@shared/schema";

export async function notifyUserOfCallCompletion(callId: number): Promise<void> {
  try {
    const call = await storage.getCall(callId);
    if (!call) return;

    // Find associated scam report if this call was triggered by a user report
    const scamReports = await storage.getScamReports();
    const relatedReport = scamReports.find(report => 
      report.phoneNumber === call.scammerNumber && !report.notificationSent
    );

    if (!relatedReport || !relatedReport.userId) return;

    const user = await storage.getUser(relatedReport.userId);
    if (!user) return;

    // Get call recordings
    const recordings = await storage.getCallRecordingsByCall(callId);
    const recordingUrl = recordings.length > 0 ? recordings[0].recordingUrl : null;

    // Create notification message
    const message = `Packie AI Update: Your scam report for ${call.scammerNumber} resulted in a ${Math.floor(call.duration / 60)}m${call.duration % 60}s call! Packie kept the scammer busy using the "${call.lastResponse}" persona. ${recordingUrl ? `Listen: ${recordingUrl}` : ''} Thanks for helping fight scams!`;

    // Send SMS notification to user
    if (user.email) {
      // For now, we'll use the phone number from the scam report as the user's contact
      // In a real implementation, users would provide their phone numbers during registration
      await sendScamReportSMS(user.email, "call_completion", message);
    }

    // Mark notification as sent
    await storage.updateScamReport(relatedReport.id, {
      notificationSent: true,
      packieResponse: `Call completed: ${call.duration}s with ${call.lastResponse} persona`
    });

    console.log(`Notification sent to user ${user.id} for completed call ${callId}`);
  } catch (error) {
    console.error(`Failed to notify user of call completion:`, error);
  }
}

export async function notifyUserOfTranscriptionReady(recordingId: number): Promise<void> {
  try {
    const recording = await storage.getCallRecording(recordingId);
    if (!recording || !recording.transcriptionText) return;

    const call = await storage.getCall(recording.callId);
    if (!call) return;

    // Find associated scam report
    const scamReports = await storage.getScamReports();
    const relatedReport = scamReports.find(report => 
      report.phoneNumber === call.scammerNumber
    );

    if (!relatedReport || !relatedReport.userId) return;

    const user = await storage.getUser(relatedReport.userId);
    if (!user) return;

    // Create transcription summary message
    const transcriptPreview = recording.transcriptionText.length > 100 
      ? recording.transcriptionText.substring(0, 100) + "..."
      : recording.transcriptionText;

    const message = `Packie AI: Call transcription ready for ${call.scammerNumber}! Preview: "${transcriptPreview}" Full audio & transcript available in your dashboard.`;

    // Send notification
    if (user.email) {
      await sendScamReportSMS(user.email, "transcription_ready", message);
    }

    console.log(`Transcription notification sent to user ${user.id} for recording ${recordingId}`);
  } catch (error) {
    console.error(`Failed to notify user of transcription:`, error);
  }
}

export async function sendWeeklySummary(): Promise<void> {
  try {
    // Get all users who have submitted scam reports
    const scamReports = await storage.getScamReports();
    const userIds = [...new Set(scamReports.filter(r => r.userId).map(r => r.userId!))];

    for (const userId of userIds) {
      const user = await storage.getUser(userId);
      if (!user) continue;

      // Get user's reports from the last week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const userReports = scamReports.filter(report => 
        report.userId === userId && 
        new Date(report.reportedAt) >= oneWeekAgo
      );

      if (userReports.length === 0) continue;

      // Calculate impact statistics
      const totalReports = userReports.length;
      let totalCallTime = 0;
      let successfulCalls = 0;

      for (const report of userReports) {
        const calls = await storage.getCalls();
        const relatedCalls = calls.filter(call => 
          call.scammerNumber === report.phoneNumber &&
          new Date(call.createdAt) >= oneWeekAgo
        );
        
        successfulCalls += relatedCalls.length;
        totalCallTime += relatedCalls.reduce((sum, call) => sum + call.duration, 0);
      }

      const message = `Weekly Packie AI Summary: Your ${totalReports} scam reports led to ${successfulCalls} successful calls, wasting ${Math.floor(totalCallTime / 60)} minutes of scammers' time! You're helping protect others. Keep up the great work!`;

      if (user.email) {
        await sendScamReportSMS(user.email, "weekly_summary", message);
      }
    }

    console.log(`Weekly summaries sent to ${userIds.length} users`);
  } catch (error) {
    console.error("Failed to send weekly summaries:", error);
  }
}

// Schedule weekly summaries (in a real app, this would be handled by a cron job)
export function scheduleWeeklySummaries(): void {
  const oneWeek = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
  
  setInterval(() => {
    sendWeeklySummary();
  }, oneWeek);
}