const { VoiceResponse } = require('twilio').twiml;
const express = require('express');
const Retell = require('retell-sdk');

const app = express();
const PORT = 3000;

// Initialise Retell Client with API key
const client = new Retell({
  apiKey: 'Insert Your API Key',
});

app.use(express.json());

// Twilio Voice Webhook - handle inbound call 
app.post('/voice-webhook', async (req, res) => {
  try {
    // Log entry into the voice-webhook
    console.log('Incoming request to /voice-webhook');

    // Register the phone call to get call id
    const phoneCallResponse = await client.call.registerPhoneCall({
      agent_id: 'Enter Your Agent ID',
      from_number: req.body.From, // Twilio provides caller's number
      to_number: req.body.To, // Twilio provides receiver's number
      direction: 'inbound', // mark it as an inbound call
    });

    const call_id = phoneCallResponse.call_id;
    
    // Prepare TwiML response to forward call to Retell SIP endpoint
    const voiceResponse = new VoiceResponse();
    const dial = voiceResponse.dial();

    //Dial the SIP endpoint using the Retell call_id
    dial.sip(`sip:${call_id}@5t4n6j0wnrl.sip.livekit.cloud`);

    // Send the TwiML response back to Twilio
    res.set('Content-Type', 'text/xml');
    res.send(voiceResponse.toString());
  } catch (error) {
    console.error('Error handling inbound call:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhostport ${PORT}`);
});