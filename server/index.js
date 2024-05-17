const dotenv = require('dotenv');
dotenv.config();

const express = require('express');

const conversation = require("./conversation-config");
const { CustomCall } = require("./call")

const resourceConnectionString = process.env.RESOURCE_CONNECTION_STRING;
const userId = process.env.USER_ID;
const callbackUri = process.env.CALLBACK_URI;
const cognitiveServicesEndpoint = process.env.COGNITIVE_SERVICE_ENDPOINT;

const call = new CustomCall(userId, callbackUri, cognitiveServicesEndpoint);

const app = express();

app.use(express.json());

app.post('/events', (req, res) => {
    for (let event of req.body) {
        if (event.type == "Microsoft.Communication.CallConnected") {
            console.log(`ChatBot: ${conversation.initalPhrase}`);
            call.startRecognizing(conversation.initalPhrase);
        } else if (event.type == "Microsoft.Communication.RecognizeCompleted") {
            let speechText = event.data.speechResult.speech;
            console.log(`Du: ${speechText}`);
            let anwser = conversation.anwser(speechText);
            console.log(`ChatBot: ${anwser}`);
            if (conversation.ended) {
                call.playText(anwser);
            } else {
                call.startRecognizing(anwser);
            }
        } else if (event.type == "Microsoft.Communication.RecognizeFailed") {
            console.log(`ChatBot: ${conversation.notRecognizablePhrase}`);
            call.startRecognizing(conversation.notRecognizablePhrase);
        } else if (event.type == "Microsoft.Communication.PlayCompleted") {
            if (conversation.ended) {
                call.endCall(true);
            }
        }
    }
    res.send();

});

const port = 3000;
app.listen(port, () => {
    console.log("Webserver started!\n");
    call.startCall();
});
