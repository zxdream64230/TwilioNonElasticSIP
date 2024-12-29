require('dotenv').config();
const { VoiceResponse } = require('twilio').twiml;
const express = require('express');
const Retell = require('retell-sdk');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialise Retell Client with API key from environment variables
const client = new Retell({
  apiKey: process.env.RETELL_API_KEY,
});

// Middleware pour parser le body - doit être AVANT les routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Twilio Voice Webhook - handle inbound call 
app.post('/voice-webhook', async (req, res) => {
  try {
    // Vérifier si l'appel vient bien de Twilio
    if (!req.body.From || !req.body.To) {
      throw new Error('Invalid request: Missing From or To number');
    }

    // Log du body brut
    console.log('Raw request:', {
      headers: req.headers,
      body: req.body,
      query: req.query
    });
    
    let n8nResponse;
    try {
      const variablesResponse = await axios.post(process.env.VARIABLES_ENDPOINT, {
        from: req.body.From,
        to: req.body.To
      }, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Retell-Twilio-Webhook/1.0'
        }
      });

      // Restructurer la réponse n8n au format attendu par Retell
      n8nResponse = {
        data: {
          retell_llm_dynamic_variables: {
            prompt_accueil: variablesResponse.data.prompt_accueil,
            first_name: variablesResponse.data.first_name,
            current_time: variablesResponse.data.current_time
          }
        }
      };
      
      console.log('Variables from n8n:', variablesResponse.data);
      console.log('Formatted variables for Retell:', n8nResponse);
    } catch (n8nError) {
      console.error('N8N Error Details:', {
        status: n8nError.response?.status,
        data: n8nError.response?.data,
        url: process.env.VARIABLES_ENDPOINT
      });
      n8nResponse = {
        data: {
          retell_llm_dynamic_variables: {
            prompt_accueil: "Tu commence par dire 'Salut'",
            first_name: "Utilisateur",
            current_time: new Date().toISOString()
          }
        }
      };
      console.log('Using fallback variables:', n8nResponse);
    }
    
    // Register the phone call to get call id
    const phoneCallResponse = await client.call.registerPhoneCall({
      agent_id: process.env.RETELL_AGENT_ID,
      from_number: req.body.From,
      to_number: req.body.To,
      direction: 'inbound',
      retell_llm_dynamic_variables: n8nResponse.data.retell_llm_dynamic_variables
    });
    
    console.log('Retell Response:', phoneCallResponse);
    console.log('Call Details:', {
      from: phoneCallResponse.from_number,
      to: phoneCallResponse.to_number,
      call_id: phoneCallResponse.call_id,
      variables: phoneCallResponse.retell_llm_dynamic_variables
    });
    
    const call_id = phoneCallResponse.call_id;
    console.log('Generated Call ID:', call_id);
    
    // Prepare TwiML response - just dial to Retell
    const voiceResponse = new VoiceResponse();
    const dial = voiceResponse.dial();
    dial.sip(`sip:${call_id}@${process.env.RETELL_SIP_DOMAIN}`);

    // Log de la réponse TwiML
    console.log('TwiML Response:', voiceResponse.toString());

    // Send the TwiML response back to Twilio
    res.set('Content-Type', 'text/xml');
    res.send(voiceResponse.toString());
  } catch (error) {
    console.error('Detailed Error:', {
      message: error.message,
      stack: error.stack,
      details: error.response?.data
    });
    res.status(500).send('Internal Server Error');
  }
});

// Add this near your other routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhostport ${PORT}`);
});