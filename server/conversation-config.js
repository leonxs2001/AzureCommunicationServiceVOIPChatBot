const { GuideElement, GuideElementInput, And, Or, Not, Conversation, InpuType } = require("./conversation");

const noEndGuideElement = new GuideElement(
    new Or(["nein", "ne", "nö"]),
    "Okay."
);
const conversation = new Conversation(
    [
        new GuideElement(
            new And([
                new Or([
                    "neu", "abschließen", "machen", "erstellen"
                ]),
                new Or([
                    "Vertrag", "Tarif", "Flat"
                ])
            ]),
            "Sie wollen also einen neuen Vertrag bei uns abschließen? Ist das richtig?",
            [
                new GuideElement(
                    new Or(["ja", "genau", "stimmt", "richtig"]),
                    "Das freut uns sehr. Welchen Tarif wünschen Sie sich denn? Den Super krassen, den krassen oder den mittleren",
                    [
                        new GuideElement(
                            new And(["super", "krass"]),
                            "Den super krassen also. Das kostet Sie dann 100 Euro im Monat.",
                        ),
                        new GuideElement(
                            "krass",
                            "Den krassen also. Das kostet Sie dann 70 Euro im Monat.",
                        ),
                        new GuideElement(
                            new Or(["mittel", "mittleren"]),
                            "Den mittleren also. Das kostet Sie dann 50 Euro im Monat!",
                        ),
                    ]
                ),
                noEndGuideElement,
            ]
        ),
        new GuideElement(
            new Or([
                "Vertrag", "Tarif", "Flat"
            ]),
            "Es geht also um einen bestehenden Vertrag? Ist das richtig?",
            [
                new GuideElement(
                    new Or(["ja", "genau", "stimmt", "richtig"]),
                    "Womit kann ich Ihnen denn dabei helfen? Wollen Sie einen besseren Tarif, haben Sie Probleme mit dem Tarif den Sie zur Zeit verwenden oder wollen Sie Ihren Zählerstand eingeben?",
                    [
                        new GuideElement(
                            "besser",
                            "Da haben Sie leider Pech, da Sie schon den krassesten haben.",
                        ),
                        new GuideElement(
                            "Problem",
                            "Ihre Probleme sind uns aber egal.",
                        ),
                        new GuideElement(
                            "stand",
                            "Bitte geben Sie dafür erst ihren Vor- und Nachnamen in der Reihenfolge an.",
                            new GuideElementInput(
                                "fullName",
                                InpuType.STRING,
                                () => true,
                                "Sind das Ihr Vor- und Nachname in der Reihenfolge?",
                                "ja",
                                "nein",
                                "Versuchen Sie noch einaml Ihren Vor- und Nachnamen in der Reihenfolge anzugeben.",
                                "Dann geben Sie jetzt bitte Ihre zwölf stellige Kundennummer an.",
                                new GuideElementInput(
                                    "customerId",
                                    InpuType.SEPERATED_NUMBER,
                                    (value) => `${value}`.length == 12,
                                    "Ist das ihre Kundennummer ja oder nein?",
                                    "Ja",
                                    "Nein",
                                    "Versuchen Sie nocheinmal Ihre zwölf stellige Kundennummer einzugeben. Achte darauf, dass diese aus zwölf Ziffern besteht.",
                                    "Nun geben Sie bitte Ihre zehn stellige Zählernummer an.",
                                    new GuideElementInput(
                                        "electricityMeterNumber",
                                        InpuType.SEPERATED_STRING,
                                        (value) => `${value}`.length == 10,
                                        "Ist das Ihre Zählernummer ja oder nein?",
                                        "Ja",
                                        "Nein",
                                        "Versuchen Sie noch mal Ihre zehn stellige Zählernummer einzugeben. Achten Sie darauf, dass die aus 10 Ziffern Und Buchstaben besteht.",
                                        "Okay das hat funktioniert. Geben Sie nun Ihren Zählerstand an?",
                                        new GuideElementInput(
                                            "meterReading",
                                            InpuType.NUMBER,
                                            () => true,
                                            "Ist dieser Zählerstand richtig ja oder nein?",
                                            "Ja",
                                            "Nein",
                                            "Versuchen Sie noch mal den Zählerstand anzusagen.",
                                            "Vielen Dank. Die Daten werden übermittelt."
                                        )
                                    )
                                )
                            )
                        )
                    ]
                ),
                noEndGuideElement
            ]
        )
    ],
    "Willkommen beim Vertragsservice des 2 und 2. Wie kann ich Ihnen helfen? Wollen Sie einen neuen Vertrag abschließen oder geht es um einen bestehenden Vertrag?",
    "Das habe ich leider nicht verstanden. Kannst du bitte nocheinmal formulieren?",
    "Ich habe leider nichts gehört. Bitte versuche laut und deutlich zu sprechen.",
    "Auf Wiedersehen.",
    (vars) => {
        console.log("\nDas sind die angegeben Daten:");
        for (let key in vars) {
            console.log(`${key}: ${vars[key]}`)
        }
        console.log("Wird gespeichert..\n");
    }
)
module.exports = conversation;