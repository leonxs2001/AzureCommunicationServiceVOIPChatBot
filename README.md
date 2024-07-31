# Cloud-based VoiceBot

This project is a cloud-based VoiceBot developed as part of a study program at the Technical University of Brandenburg. It utilizes Azure services for speech processing and communication.

## Overview

The VoiceBot consists of a frontend and a backend that communicate via HTTPS (HTTPS is mandatory!). It uses Azure Communication Services and Cognitive Services for speech processing and call control.

### Architecture

- Frontend: Web-based user interface
- Backend: Node.js with Express.js
- Azure Services: Communication Services, Cognitive Services

![image](https://github.com/user-attachments/assets/284fd9c1-359e-4eb8-8ff1-521a16ee5e24)

## Technical Details

### Frontend

- Implemented with JavaScript
- Creates users and calls through API requests to the backend

### Backend

The backend is divided into three main components:

1. **Call**
   - Stores the conversation
   - Initiates the call (CallAutomationClient)
   - Controls speech output
   - Initiates speech recognition

2. **Conversation**
   - Manages the conversation flow
   - Includes greeting, standard texts, and farewell
   - Implements a guide mechanism for structured conversations

3. **ChatBot**
   - Acts as a web server
   - Creates users and calls
   - Processes WebHooks
   - Implements event handlers for various call states

## Configuration

- Virtual machine with HTTPS web server
- Backend: Node.js and Express.js
- Frontend: Bundled with Parcel
- Reverse Proxy: e.g., Nginx
- Integration with Azure Communication Services and Cognitive Services
