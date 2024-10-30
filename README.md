# Twilio and Retell Voice Call Integration

This Node.js application integrates Twilio's Voice API with the Retell SDK, allowing inbound calls to be routed through Retell's SIP endpoint. The project leverages Express.js to handle HTTP requests and sets up a Twilio Voice Webhook for processing inbound calls. The call is registered with Retell to obtain a `call_id`, which is then used to route the call through Retell's SIP infrastructure.

## Prerequisites

- [Node.js](https://nodejs.org/) installed (v12 or higher recommended)
- [Twilio](https://www.twilio.com/) account
- [Retell](https://retell.io/) account and API key

## Getting Started

1. **Clone the Repository**
   ```bash
   git clone https://github.com/HamChowderr/TwilioNonElasticSIP.git
   cd TwilioNonElasticSIP
   ```

2. **Install Dependencies**
   ```bash
   npm install express twilio retell-sdk
   ```

3. **Configure API Keys**
   - Open `index.js` (or your server file) and insert your Retell API key in place of `Insert Your API Key`.
   - Replace `Enter Your Agent ID` with your Retell Agent ID.

## Usage

1. **Start the Server**
   ```bash
   node index.js
   ```
   The server will start at `http://localhost:3000`.

2. **Set Up Twilio Webhook**
   - In your [Twilio Console](https://www.twilio.com/console), configure your Twilio phone number to use `http://your-server-url/voice-webhook` as the Voice Webhook URL for handling inbound calls.

3. **Make an Inbound Call**
   - When a call is received, the application:
     - Registers the call with Retell, capturing the call ID.
     - Creates a TwiML response to forward the call to Retell's SIP endpoint using the generated `call_id`.
     - Returns the response to Twilio, which completes the forwarding process.

## Project Structure

- `index.js`: Main application file, handling inbound calls via Twilio's Voice Webhook and routing them to Retell's SIP.
- `express`: Handles server and request processing.
- `twilio`: Manages Twilio's Voice API requests.
- `retell-sdk`: Manages Retell's API calls for call registration and SIP routing.

## Environment Variables

For security, store your API key and Agent ID in environment variables:

```plaintext
RETELL_API_KEY=your_retell_api_key
RETELL_AGENT_ID=your_agent_id
PORT=3000
```

## Example Response Flow

1. **Inbound Call**: An inbound call triggers Twilio to hit the `/voice-webhook` endpoint.
2. **Call Registration**: The server registers the call with Retell and retrieves a `call_id`.
3. **SIP Forwarding**: The call is forwarded to Retell's SIP endpoint using the `call_id`.

## Error Handling

Any errors during the call processing are logged to the console and a `500 Internal Server Error` is returned to the caller.

## License

This project is licensed under the MIT License.

## Credits

This integration setup was inspired by a solution provided by **@Emagine Reality**. For more insights and support, check out the [AI Connect Skool group](https://skool.com/aiconnect).

## Troubleshooting

Ensure your Twilio phone number is correctly configured to forward calls to your server's `/voice-webhook` endpoint. Additionally, check that Retell SDK credentials and Agent ID are properly set up.

---

For more information, visit the [GitHub repository](https://github.com/HamChowderr/TwilioNonElasticSIP).

Happy coding!
```

This version includes the Skool group link and credits @Emagine Reality for the fix.
