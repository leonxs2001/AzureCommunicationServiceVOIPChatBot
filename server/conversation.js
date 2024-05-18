const conversation = require("./conversation-config");

class GuideElement {
    constructor(question, anwser, nextGuideElements) {
        this.question = question;
        this.anwser = anwser;
        this.nextGuideElements = nextGuideElements;//TODO rename
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
    constructor(guide, initialPhrase = "", notUndestandablePhrase = "", notRecognizablePhrase = "", endPhrase = "") {
        this._initialPhrase = initialPhrase;
        this._guide = guide;

        this._notUndestandablePhrase = notUndestandablePhrase;
        this._notRecognizablePhrase = notRecognizablePhrase;
        this._endPhrase = endPhrase;
        this._ended = false;
    }

    anwser(question) {
        for (let guideElement of this._guide) {
            if (check(question, guideElement.question)) {
                if (guideElement.nextGuideElements) {
                    this._guide = guideElement.nextGuideElements;
                    return guideElement.anwser;
                } else {
                    this._ended = true;
                    if (guideElement.anwser) {
                        return guideElement.anwser + " " + this._endPhrase;
                    } else {
                        return this._endPhrase;
                    }

                }
            }
        }

        return this.notUndestandablePhrase;
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

module.exports = { GuideElement, And, Or, Not, Conversation }