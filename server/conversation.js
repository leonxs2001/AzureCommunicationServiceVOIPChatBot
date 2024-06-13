const e = require("express");
const conversation = require("./conversation-config");

const InpuType = Object.freeze({
    NUMBER: "NUMBER",
    SEPERATED_NUMBER: "SEPERATED_NUMBER",
    STRING: "STRING",
    SEPERATED_STRING: "SEPERATED_STRING",
});

class GuideElement {
    constructor(question, anwser, nextGuideElements) {
        this.question = question;
        this.anwser = anwser;
        this.nextGuideElements = nextGuideElements;
    }

    clone(){
        return new GuideElement(this.question, this.anwser, cloneGuide(this.nextGuideElements));
    }
}

class GuideElementInput {
    constructor(variableName, inputType, validatorFunction = (value) => true, confirmQuestion, confirmAnwser, denyAnwser, tryAgainQuestion, nextQuestion, nextGuideElements) {
        this.variableName = variableName;
        this.nextGuideElements = nextGuideElements;
        this.confirmQuestion = confirmQuestion;
        this.tryAgainQuestion = tryAgainQuestion
        this.confirmAnwser = confirmAnwser;
        this.denyAnwser = denyAnwser;
        this.nextQuestion = nextQuestion;
        this.inputType = inputType;
        this._confirmationRequested = false;
        this.validatorFunction = validatorFunction;
    }

    get confirmationRequested(){
        return this._confirmationRequested;
    }

    set confirmationRequested(confirmationRequested){
        this._confirmationRequested = confirmationRequested;
    }

    clone(){
        return new GuideElementInput(this.variableName, this.inputType, this.validatorFunction, this.confirmQuestion, this.confirmAnwser, this.denyAnwser, this.tryAgainQuestion, this.nextQuestion, cloneGuide(this.nextGuideElements));
    }
}

class And {
    constructor(andList) {
        this.andList = andList;
    }

    check(text) {
        for (let element of this.andList) {
            if (!check(text, element)) {
                return false;
            }
        }
        return true;
    }
}

class Or {
    constructor(orList) {
        this.orList = orList;
    }

    check(text) {
        for (let element of this.orList) {
            if (check(text, element)) {
                return true;
            }
        }
        return false;
    }
}

class Not {
    constructor(notAttribute) {
        this.notAttribute = notAttribute;
    }

    check(text) {
        return !check(text, this.notAttribute);
    }
}

class Conversation {
    constructor(guide, initialPhrase = "", notUndestandablePhrase = "", notRecognizablePhrase = "", endPhrase = "", finishedConversationHandle = (vars) => { }, maxNotUnderstandableCounts = 2) {
        this._initialPhrase = initialPhrase;
        this._guide = guide;

        this._notUndestandablePhrase = notUndestandablePhrase;
        this._notRecognizablePhrase = notRecognizablePhrase;
        this._endPhrase = endPhrase;
        this._ended = false;
        this._vars = {}
        this._notUnderstandableCounter = 0;
        this._maxNotUnderstandableCounts = maxNotUnderstandableCounts;
        this._lastQuestion = initialPhrase;
        this._finishedConversationHandle = finishedConversationHandle;
    }

    clone() {
        return new Conversation(cloneGuide(this._guide), this._initialPhrase, this._notUndestandablePhrase, this._notRecognizablePhrase, this._endPhrase, this._finishedConversationHandle, this._maxNotUnderstandableCounts);
    }

    _endConversation() {
        this._ended = true;
        this._finishedConversationHandle(this._vars);
    }

    anwser(question) {
        if (this._guide instanceof GuideElementInput) {
            if (!this._guide.confirmationRequested) {
                let result = question.trim();
                if (".!?".includes(result[result.length - 1])) {
                    result = result.slice(0, -1);
                }

                if(this._guide.inputType == InpuType.SEPERATED_STRING || this._guide.inputType == InpuType.SEPERATED_NUMBER){
                    result = result.replace(/\s/g, "");
                }

                if (this._guide.inputType != InpuType.STRING && this._guide.inputType != InpuType.SEPERATED_STRING) {
                    if (this._guide.inputType == InpuType.NUMBER) {
                        result = result.replace(/,/, '.');
                        result = Number(result);
                    } else {
                        result = Number.parseInt(result);
                    }

                } else {
                    result = result.replace(/[^\w\säöüß]/gi, "");
                    
                }
                if (result && this._guide.validatorFunction(result)) {
                    this._vars[this._guide.variableName] = result;
                    this._guide.confirmationRequested = true;
                    if (this._guide.inputType == InpuType.SEPERATED_NUMBER || this._guide.inputType == InpuType.SEPERATED_STRING) {
                        result = `${result}`.split("").join(" ");
                    } else if (this._guide.inputType == InpuType.NUMBER) {
                        result = `${result}`.replace(/\./, ",");
                    }
                    this._lastQuestion = `${this._guide.confirmQuestion} ${result}`;
                    return this._lastQuestion;
                } else {
                    return this._guide.tryAgainQuestion;
                }
            } else {
                if (check(question, this._guide.confirmAnwser)) {
                    this._notUnderstandableCounter = 0;
                    if (this._guide.nextGuideElements) {
                        let nextQuestion = this._guide.nextQuestion;
                        this._guide = this._guide.nextGuideElements;
                        this._lastQuestion = nextQuestion;
                        return nextQuestion;
                    } else {
                        this._endConversation();
                        return `${this._guide.nextQuestion} ${this._endPhrase}`;
                    }
                } else if (check(question, this._guide.denyAnwser)) {
                    this._notUnderstandableCounter = 0;
                    this._guide.confirmationRequested = false;
                    this._lastQuestion = this._guide.tryAgainQuestion;
                    return this._guide.tryAgainQuestion;
                }
            }
        } else {
            for (let guideElement of this._guide) {
                if (check(question, guideElement.question)) {
                    if (guideElement.nextGuideElements) {
                        this._guide = guideElement.nextGuideElements;
                        this._notUnderstandableCounter = 0;
                        this._lastQuestion = guideElement.anwser;
                        return guideElement.anwser;
                    } else {
                        this._endConversation();
                        if (guideElement.anwser) {
                            return `${guideElement.anwser} ${this._endPhrase}`;
                        } else {
                            return this._endPhrase;
                        }

                    }
                }
            }
        }

        this._notUnderstandableCounter++;
        if (this._notUnderstandableCounter >= this._maxNotUnderstandableCounts) {
            this._notUnderstandableCounter = 0;
            return this.notUndestandablePhrase + " " + this._lastQuestion;
        } else {
            return this.notUndestandablePhrase;
        }


    }

    get initalPhrase() {
        return this._initialPhrase;
    }

    get notUndestandablePhrase() {
        return this._notUndestandablePhrase;
    }

    get notRecognizablePhrase() {
        return this._notRecognizablePhrase;
    }

    get endPhrase() {
        return this._endPhrase;
    }

    get ended() {
        return this._ended;
    }
}

function check(text, object) {
    if (typeof object === "string") {
        return text.toLowerCase().includes(object.toLowerCase());
    } else if (object instanceof And || object instanceof Or || object instanceof Not) {
        return object.check(text);
    } else {
        return false;
    }

}

function cloneGuide(guide){
    if(guide instanceof GuideElementInput){
        return guide.clone();
    }else if(Array.isArray(guide)){
        let result = [];
        for(let element of guide){
            result.push(element.clone());
        }
        return result;
    }else{
        return guide;
    }
}

module.exports = { GuideElement, GuideElementInput, And, Or, Not, Conversation, InpuType }