// Privacy utilities for protecting user data
export function anonymizePhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return 'Unknown';
  
  // Remove any non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  if (digits.length < 4) return '***-****';
  
  // Show only last 4 digits for US numbers (10+ digits)
  if (digits.length >= 10) {
    return `***-***-${digits.slice(-4)}`;
  }
  
  // For shorter numbers, show only last 2 digits
  return `***-**${digits.slice(-2)}`;
}

export function anonymizeEmail(email: string): string {
  if (!email || !email.includes('@')) return 'protected@email.com';
  
  const [username, domain] = email.split('@');
  if (username.length <= 2) return `**@${domain}`;
  
  return `${username.charAt(0)}***${username.charAt(username.length - 1)}@${domain}`;
}

export function generateCallId(phoneNumber: string): string {
  // Generate a consistent but anonymous call ID based on phone number
  let hash = 0;
  for (let i = 0; i < phoneNumber.length; i++) {
    const char = phoneNumber.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `CALL-${Math.abs(hash).toString(36).toUpperCase().slice(0, 6)}`;
}