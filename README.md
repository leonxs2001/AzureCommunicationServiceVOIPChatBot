# Cloudbasierter VoiceBot

Dieses Projekt ist ein cloudbasierter VoiceBot, der im Rahmen eines Studiums an der Technischen Hochschule Brandenburg entwickelt wurde. Es nutzt Azure-Dienste für die Sprachverarbeitung und Kommunikation.

## Überblick

Der VoiceBot besteht aus einem Frontend und einem Backend, die über HTTPS kommunizieren (HTTPS ist zwingend nötig!). Er verwendet Azure Communication Services und Cognitive Services für die Sprachverarbeitung und Anrufsteuerung.

### Architektur

- Frontend: Webbasierte Benutzeroberfläche
- Backend: Node.js mit Express.js
- Azure-Dienste: Communication Services, Cognitive Services

## Technische Details

### Frontend

- Implementiert mit JavaScript
- Erstellt Benutzer und Anrufe über API-Aufrufe zum Backend

### Backend

Das Backend ist in drei Hauptkomponenten aufgeteilt:

1. **Call**
   - Speichert die Konversation
   - Startet den Anruf (CallAutomationClient)
   - Steuert die Sprachausgabe
   - Initiiert die Spracherkennung

2. **Conversation**
   - Verwaltet den Gesprächsablauf
   - Beinhaltet Begrüßung, Standardtexte und Verabschiedung
   - Implementiert einen Guide-Mechanismus für strukturierte Gespräche

3. **ChatBot**
   - Fungiert als Webserver
   - Erstellt Benutzer und Anrufe
   - Verarbeitet WebHooks
   - Implementiert Event-Handler für verschiedene Anrufzustände

## Konfiguration

- Virtuelle Maschine mit HTTPS-Webserver
- Backend: Node.js und Express.js
- Frontend: Gebündelt mit Parcel
- Reverse Proxy: z.B. Nginx
- Integration mit Azure Communication Services und Cognitive Services
