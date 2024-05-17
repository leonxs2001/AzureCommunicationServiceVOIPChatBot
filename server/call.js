const { CallAutomationClient } = require("@azure/communication-call-automation");

const VOICE_LANGUAGE = "de-DE";
const VOICE_NAME = "de-DE-ChristophNeural";

class CustomCall {
    static _callAutomationClient = new CallAutomationClient(process.env.RESOURCE_CONNECTION_STRING);

    constructor(communicationUserId, callbackUri, cognitiveServicesEndpoint, voiceLanguage, voiceName) {
        this._communicationUserId = communicationUserId;
        this._callInvite = {
            targetParticipant: {
                communicationUserId: communicationUserId
            }
        }
        this._callbackUri = callbackUri;
        this._cognitiveServicesEndpoint = cognitiveServicesEndpoint;
        this._voiceLanguage = voiceLanguage | VOICE_LANGUAGE;
        this._voiceName = voiceName | VOICE_NAME;
        
    }

    async startCall() {
        const createCallOptions = {
            callIntelligenceOptions: {
                cognitiveServicesEndpoint: this._cognitiveServicesEndpoint,
            }
        };

        this._callResult = await CustomCall._callAutomationClient.createCall(this._callInvite, this._callbackUri, createCallOptions);
    }

    async endCall() {
        if (this._callResult) {
            await this._callResult.callConnection.hangUp(true);
        }
    }

    async playText(text) {
        if (this._callResult) {
            const callMedia = this._callResult.callConnection.getCallMedia();
            const playSource = { text: text, voiceName: VOICE_NAME, kind: "textSource" };
            await callMedia.playToAll([playSource,]);
        }
    }

    async startRecognizing(question) {
        const callMedia = this._callResult.callConnection.getCallMedia();
        const playSource = { text: question, voiceName: VOICE_NAME, kind: "textSource" };
        const recognizeOptions = {
            endSilenceTimeoutInSeconds: 1,
            initialSilenceTimeoutInSeconds: 10,
            playPrompt: playSource,
            operationContext: "OpenQuestionSpeech",
            kind: "callMediaRecognizeSpeechOptions",
            speechLanguage: VOICE_LANGUAGE
        };

        await callMedia.startRecognizing(this._callInvite.targetParticipant, recognizeOptions);
    }
}

module.exports = { CustomCall };

