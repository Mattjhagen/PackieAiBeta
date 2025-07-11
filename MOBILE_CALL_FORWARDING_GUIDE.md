# PackieAI Mobile Call Forwarding Integration

## Overview
This guide explains how to automatically forward suspected scam calls to PackieAI personas on iOS and Android devices using native telephony APIs and call screening capabilities.

## Architecture

### Core Components
1. **Native Mobile Apps** (iOS/Android) with call screening permissions
2. **Real-time Scam Detection** using Truecaller and internal databases
3. **Call Forwarding Service** that redirects calls to PackieAI personas
4. **Cloud Integration** with PackieAI backend for persona management

## iOS Implementation

### Required Capabilities
- CallKit framework for call management
- Call Directory Extension for spam identification
- Background App Refresh for real-time detection
- Network permissions for API communication

### iOS App Structure
```
PackieAI-iOS/
├── PackieAI.xcodeproj
├── PackieAI/
│   ├── CallScreeningManager.swift
│   ├── TruecallerIntegration.swift
│   ├── PersonaForwarder.swift
│   └── PackieAIService.swift
├── CallDirectoryExtension/
│   └── CallDirectoryHandler.swift
└── CallScreeningExtension/
    └── CallScreeningHandler.swift
```

### Key iOS Implementation Files

#### CallScreeningManager.swift
```swift
import CallKit
import ContactsUI

class CallScreeningManager: NSObject, CXCallObserverDelegate {
    private let callObserver = CXCallObserver()
    private let packieService = PackieAIService()
    
    override init() {
        super.init()
        callObserver.setDelegate(self, queue: nil)
    }
    
    func callObserver(_ callObserver: CXCallObserver, callChanged call: CXCall) {
        if call.isIncoming && !call.isConnected {
            Task {
                await handleIncomingCall(call)
            }
        }
    }
    
    private func handleIncomingCall(_ call: CXCall) async {
        guard let phoneNumber = call.remoteHandle?.value else { return }
        
        // Check against Truecaller and internal databases
        let scamDetection = await packieService.checkForScam(phoneNumber: phoneNumber)
        
        if scamDetection.isScam {
            // Forward to PackieAI persona
            await forwardToPersona(call: call, scamType: scamDetection.scamType)
        }
    }
    
    private func forwardToPersona(call: CXCall, scamType: String) async {
        // Use CallKit to redirect the call
        let provider = CXProvider(configuration: createProviderConfiguration())
        let controller = CXCallController()
        
        // End the original call and start forwarded call
        let endAction = CXEndCallAction(call: call.uuid)
        let transaction = CXTransaction(action: endAction)
        
        do {
            try await controller.request(transaction)
            
            // Initiate forwarded call to PackieAI
            let forwardNumber = await packieService.getPersonaPhoneNumber(for: scamType)
            let startAction = CXStartCallAction(call: UUID(), handle: CXHandle(type: .phoneNumber, value: forwardNumber))
            let forwardTransaction = CXTransaction(action: startAction)
            
            try await controller.request(forwardTransaction)
        } catch {
            print("Call forwarding failed: \(error)")
        }
    }
}
```

#### TruecallerIntegration.swift
```swift
import Foundation

class TruecallerIntegration {
    private let apiKey: String
    private let baseURL = "https://search5-noneu.truecaller.com/v2/search"
    
    init(apiKey: String) {
        self.apiKey = apiKey
    }
    
    func lookupNumber(_ phoneNumber: String) async -> ScamDetectionResult {
        guard let url = URL(string: "\(baseURL)?q=\(phoneNumber)&type=4") else {
            return ScamDetectionResult(isScam: false, confidence: 0.0, scamType: nil)
        }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        
        do {
            let (data, _) = try await URLSession.shared.data(for: request)
            let response = try JSONDecoder().decode(TruecallerResponse.self, from: data)
            
            return parseScamResult(from: response)
        } catch {
            print("Truecaller lookup failed: \(error)")
            return ScamDetectionResult(isScam: false, confidence: 0.0, scamType: nil)
        }
    }
    
    private func parseScamResult(from response: TruecallerResponse) -> ScamDetectionResult {
        guard let data = response.data.first else {
            return ScamDetectionResult(isScam: false, confidence: 0.0, scamType: nil)
        }
        
        let isSpam = data.spamInfo?.spamScore ?? 0 > 0.5
        let scamType = data.spamInfo?.spamType ?? "unknown"
        
        return ScamDetectionResult(
            isScam: isSpam,
            confidence: data.spamInfo?.spamScore ?? 0.0,
            scamType: isSpam ? scamType : nil
        )
    }
}

struct ScamDetectionResult {
    let isScam: Bool
    let confidence: Double
    let scamType: String?
}

struct TruecallerResponse: Codable {
    let data: [TruecallerData]
}

struct TruecallerData: Codable {
    let spamInfo: SpamInfo?
}

struct SpamInfo: Codable {
    let spamScore: Double
    let spamType: String
}
```

## Android Implementation

### Required Permissions
```xml
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.ANSWER_PHONE_CALLS" />
<uses-permission android:name="android.permission.READ_CALL_LOG" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

<!-- Android 10+ call screening -->
<uses-permission android:name="android.permission.CALL_SCREENING_SERVICE" />
```

### Android App Structure
```
PackieAI-Android/
├── app/
│   ├── src/main/java/com/packieai/
│   │   ├── CallScreeningService.java
│   │   ├── TruecallerIntegration.java
│   │   ├── PersonaForwarder.java
│   │   ├── PackieAIService.java
│   │   └── MainActivity.java
│   └── src/main/AndroidManifest.xml
```

### Key Android Implementation Files

#### CallScreeningService.java
```java
package com.packieai;

import android.telecom.Call;
import android.telecom.CallScreeningService;
import android.util.Log;

public class PackieCallScreeningService extends CallScreeningService {
    private static final String TAG = "PackieCallScreening";
    private TruecallerIntegration truecaller;
    private PackieAIService packieService;
    
    @Override
    public void onCreate() {
        super.onCreate();
        truecaller = new TruecallerIntegration(getApiKey());
        packieService = new PackieAIService();
    }
    
    @Override
    public void onScreenCall(Call.Details callDetails) {
        String phoneNumber = callDetails.getHandle().getSchemeSpecificPart();
        
        // Run scam detection in background thread
        new Thread(() -> {
            try {
                ScamDetectionResult result = truecaller.checkNumber(phoneNumber);
                
                if (result.isScam()) {
                    // Forward to PackieAI persona
                    forwardToPersona(callDetails, result);
                } else {
                    // Allow call through
                    respondToCall(callDetails, new CallResponse.Builder()
                        .setDisallowCall(false)
                        .setSkipCallLog(false)
                        .build());
                }
            } catch (Exception e) {
                Log.e(TAG, "Error screening call", e);
                // Default to allowing call
                respondToCall(callDetails, new CallResponse.Builder()
                    .setDisallowCall(false)
                    .build());
            }
        }).start();
    }
    
    private void forwardToPersona(Call.Details callDetails, ScamDetectionResult result) {
        try {
            // Block the original call
            respondToCall(callDetails, new CallResponse.Builder()
                .setDisallowCall(true)
                .setSkipCallLog(true)
                .setSkipNotification(true)
                .build());
            
            // Get appropriate persona number
            String personaNumber = packieService.getPersonaNumber(result.getScamType());
            
            // Forward the call
            PersonaForwarder forwarder = new PersonaForwarder();
            forwarder.forwardCall(
                callDetails.getHandle().getSchemeSpecificPart(),
                personaNumber,
                result.getScamType()
            );
            
        } catch (Exception e) {
            Log.e(TAG, "Error forwarding call to persona", e);
        }
    }
    
    private String getApiKey() {
        // Retrieve from secure storage or environment
        return BuildConfig.TRUECALLER_API_KEY;
    }
}
```

#### TruecallerIntegration.java
```java
package com.packieai;

import okhttp3.*;
import com.google.gson.Gson;
import java.io.IOException;

public class TruecallerIntegration {
    private static final String BASE_URL = "https://search5-noneu.truecaller.com/v2/search";
    private final OkHttpClient client;
    private final String apiKey;
    private final Gson gson;
    
    public TruecallerIntegration(String apiKey) {
        this.apiKey = apiKey;
        this.client = new OkHttpClient();
        this.gson = new Gson();
    }
    
    public ScamDetectionResult checkNumber(String phoneNumber) throws IOException {
        String url = BASE_URL + "?q=" + phoneNumber + "&type=4";
        
        Request request = new Request.Builder()
            .url(url)
            .addHeader("Authorization", "Bearer " + apiKey)
            .addHeader("User-Agent", "PackieAI-Android/1.0")
            .build();
        
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected response: " + response);
            }
            
            String responseBody = response.body().string();
            TruecallerResponse truecallerResponse = gson.fromJson(responseBody, TruecallerResponse.class);
            
            return parseScamResult(truecallerResponse);
        }
    }
    
    private ScamDetectionResult parseScamResult(TruecallerResponse response) {
        if (response.data == null || response.data.isEmpty()) {
            return new ScamDetectionResult(false, 0.0, null);
        }
        
        TruecallerData data = response.data.get(0);
        SpamInfo spamInfo = data.spamInfo;
        
        if (spamInfo == null) {
            return new ScamDetectionResult(false, 0.0, null);
        }
        
        boolean isScam = spamInfo.spamScore > 0.5;
        return new ScamDetectionResult(isScam, spamInfo.spamScore, 
            isScam ? spamInfo.spamType : null);
    }
}

class ScamDetectionResult {
    private final boolean isScam;
    private final double confidence;
    private final String scamType;
    
    public ScamDetectionResult(boolean isScam, double confidence, String scamType) {
        this.isScam = isScam;
        this.confidence = confidence;
        this.scamType = scamType;
    }
    
    public boolean isScam() { return isScam; }
    public double getConfidence() { return confidence; }
    public String getScamType() { return scamType; }
}
```

## Backend Integration

### API Endpoints for Mobile Apps

Add these endpoints to your PackieAI server:

```javascript
// Mobile app authentication and persona assignment
app.post('/api/mobile/auth', async (req, res) => {
  const { deviceId, phoneNumber } = req.body;
  
  try {
    // Authenticate mobile device
    const authToken = await generateMobileAuthToken(deviceId, phoneNumber);
    res.json({ authToken, success: true });
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// Get available persona phone number for forwarding
app.get('/api/mobile/persona/:scamType', requireMobileAuth, async (req, res) => {
  const { scamType } = req.params;
  
  try {
    const availablePersona = await getAvailablePersona(scamType);
    res.json({
      personaNumber: availablePersona.phoneNumber,
      personaName: availablePersona.name,
      estimatedWaitTime: availablePersona.estimatedWaitTime
    });
  } catch (error) {
    res.status(500).json({ error: 'No personas available' });
  }
});

// Register forwarded call
app.post('/api/mobile/forward-call', requireMobileAuth, async (req, res) => {
  const { originalNumber, personaNumber, scamType, confidence } = req.body;
  
  try {
    const callId = await registerForwardedCall({
      originalNumber,
      personaNumber,
      scamType,
      confidence,
      timestamp: new Date()
    });
    
    res.json({ callId, success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register call' });
  }
});

// Real-time scam database lookup
app.post('/api/mobile/check-number', requireMobileAuth, async (req, res) => {
  const { phoneNumber } = req.body;
  
  try {
    // Check against Truecaller and internal databases
    const truecallerResult = await truecallerService.lookupNumber(phoneNumber);
    const internalResult = await storage.checkFraudDatabase(phoneNumber);
    
    const combinedResult = {
      isScam: truecallerResult?.isSpam || internalResult?.isScam || false,
      confidence: Math.max(
        truecallerResult?.spamScore || 0,
        internalResult?.confidence || 0
      ),
      scamType: truecallerResult?.spamType || internalResult?.scamType || 'unknown',
      sources: {
        truecaller: !!truecallerResult?.isSpam,
        internal: !!internalResult?.isScam
      }
    };
    
    res.json(combinedResult);
  } catch (error) {
    res.status(500).json({ error: 'Lookup failed' });
  }
});
```

## Deployment Instructions

### iOS Deployment
1. **Developer Account**: Requires Apple Developer Program membership
2. **App Store Review**: Submit app with call screening capabilities
3. **User Permissions**: Users must manually enable call screening in Settings
4. **Distribution**: TestFlight for beta testing, App Store for production

### Android Deployment
1. **Google Play Console**: Upload APK with call screening service
2. **Permissions**: Request phone and call screening permissions
3. **Default Dialer**: App can optionally become default dialer app
4. **Distribution**: Google Play Store or direct APK distribution

## Security Considerations

### Data Privacy
- All call metadata encrypted in transit and at rest
- User phone numbers hashed before storage
- Opt-in consent for call forwarding
- Compliance with GDPR, CCPA, and telecommunications regulations

### API Security
- JWT tokens for mobile app authentication
- Rate limiting on all endpoints
- TLS 1.3 encryption for all communications
- API key rotation for external services

## User Setup Process

### Initial Configuration
1. Download PackieAI mobile app
2. Grant necessary permissions (phone, call screening)
3. Enable as default call screening service
4. Configure forwarding preferences
5. Test with known scam numbers

### Ongoing Management
- Review forwarded calls in app dashboard
- Adjust scam detection sensitivity
- Update persona preferences
- Monitor call forwarding statistics

## Testing and Validation

### Test Scenarios
1. **Known Scam Numbers**: Test against confirmed scammer database
2. **Legitimate Calls**: Ensure normal calls pass through
3. **Edge Cases**: Handle network failures, API timeouts
4. **Performance**: Measure call screening latency

### Monitoring
- Call forwarding success rate
- False positive/negative rates
- User satisfaction metrics
- System performance monitoring

This comprehensive mobile integration enables automatic scam call forwarding to PackieAI personas, providing seamless protection for users while gathering valuable scam intelligence.