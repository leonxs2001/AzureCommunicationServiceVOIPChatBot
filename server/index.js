const { CallAutomationClient } = require("@azure/communication-call-automation");
const express = require('express');
const dotenv = require('dotenv');
const conversation = require("./conversation-config");

dotenv.config();

const resourceConnectionString = process.env.RESOURCE_CONNECTION_STRING;
const userId = process.env.USER_ID;
const callbackUri = process.env.CALLBACK_URI;
const cognitiveServicesEndpoint = process.env.COGNITIVE_SERVICE_ENDPOINT;

const callInvite = {
    targetParticipant: {
        communicationUserId: userId
    }
}

let client;
let callResult;

const app = express();

app.use(express.json());

app.post('/events', (req, res) => {
    for (let event of req.body) {
        if (event.type == "Microsoft.Communication.CallConnected") {
            console.log(`ChatBot: ${conversation.initalPhrase}`);
            ask(conversation.initalPhrase);
        } else if (event.type == "Microsoft.Communication.RecognizeCompleted") {
            let speechText = event.data.speechResult.speech;
            console.log(`Du: ${speechText}`);
            let anwser = conversation.anwser(speechText);
            console.log(`ChatBot: ${anwser}`);
            if (conversation.ended) {
                talk(anwser);
            } else {
                ask(anwser);
            }
        } else if (event.type == "Microsoft.Communication.RecognizeFailed") {
            console.log(`ChatBot: ${conversation.notRecognizablePhrase}`);
            ask(conversation.notRecognizablePhrase);
        } else if (event.type == "Microsoft.Communication.PlayCompleted") {
            if (conversation.ended) {
                callResult.callConnection.hangUp(true);
            }
        }
    }
    res.send();

});

const port = 3000;
app.listen(port, () => {
    console.log("Webserver started!");
    callUser();
});

async function callUser() {
    client = new CallAutomationClient(resourceConnectionString);

    const createCallOptions = {
        callIntelligenceOptions: {
            cognitiveServicesEndpoint: cognitiveServicesEndpoint,
        }
    };

    callResult = await client.createCall(callInvite, callbackUri, createCallOptions);

}

async function ask(openQuestion) {
    const callMedia = callResult.callConnection.getCallMedia();
    const playSource = { text: openQuestion, voiceName: "de-DE-ChristophNeural", kind: "textSource" };
    const recognizeOptions = {
        endSilenceTimeoutInSeconds: 1,
        initialSilenceTimeoutInSeconds: 10,
        playPrompt: playSource,
        operationContext: "OpenQuestionSpeech",
        kind: "callMediaRecognizeSpeechOptions",
        speechLanguage: "de-DE"
    };

    await callMedia.startRecognizing(callInvite.targetParticipant, recognizeOptions);
}

async function talk(text) {
    const callMedia = callResult.callConnection.getCallMedia();
    const playSource = { text: text, voiceName: "de-DE-ChristophNeural", kind: "textSource" };
    await callMedia.playToAll([playSource,]);
}

