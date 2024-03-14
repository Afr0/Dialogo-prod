import DialogoModel from "../DialogoModel.js";
import TranslateView from "../Views/TranslateView.js";
import LanguageManager from "../LanguageManager.js";

/**
 * Controller for the Translate view.
 * A controller acts as a bridge between the Model and the View in the MVC pattern.
 * Using a Controller ensures that a Model is never aware of the View and vice
 * versa, ensuring separation of concerns.
 */
class TranslateController {
    #Model;
    #View;
    #LangManager = new LanguageManager();

    constructor(TranslateModel, TranslateView) {
        this.#Model = TranslateModel;
        this.#View = TranslateView;

        let btnSubmit = document.getElementById("btnSubmit");
        let txtSentences = document.getElementById("txtSentences");

        btnSubmit.addEventListener("click", async () => {
            let wordsToSend = txtSentences.value.split("\n");

            this.#Model.postData(TRANSLATE_URL,
                {sentences : wordsToSend}, "application/json", "", "", false).then(response => {
                    let dropDown = document.createElement("select");
                    
                    //WTF Google?!
                    response.translations.forEach(wtfGoogle => {
                        wtfGoogle.translations.forEach(notReallyActualTranslation => {
                            if(notReallyActualTranslation !== null) { //This is actually a thing...
                                notReallyActualTranslation.data.translations.forEach(actualTranslation => {
                                    let option = document.createElement("option");
                                    option.value = actualTranslation.translatedText;
                                    option.textContent = actualTranslation.translatedText;
                                    dropDown.appendChild(option);
                                });
                            } 
                        });
                    });

                    document.body.appendChild(dropDown);

                }).catch((error) => {
                    this.#View.createToast(LanguageManager.getTranslation("newuserfailure"));
                    console.log(error);
                });
        });
    }
}

const TRANSLATE_URL = "https://${process.env.CONNECTION_DOMAIN}/translations";

//Ensure the Controller is initialized when the webpage has been
//loaded.
document.addEventListener("DOMContentLoaded", function() {
    let appModel = new DialogoModel(DialogoModel.USER_CACHE_NAME);
    let appView = new TranslateView();
    let appController = new TranslateController(appModel, appView);
});