import DialogoModel from "../DialogoModel.js";
import AlphabetGameView from "../Views/AlphabetGameView.js";
import LanguageManager, { Languages } from "../LanguageManager.js";
import IndexController from "../Controllers/IndexController.js";
import LanguagePortalController from "./LanguagePortalController.js";

const ALPHABET_DIR = "data/alphabets/";
const ALPHABET_SOUNDS_DIR = "data/sounds/alphabets/";

/**
 * Controller for the Login view.
 */
export default class AlphabetGameController {
    #Model;
    #View;
    #appLanguage = "";
    #currentLanguage = "";
    #soundPath = "";
    #alphabet = {};
    #appAlphabet = {};

    /**Constructs a new instance of the AlphabetGameController.
     * @param {string} [learningLanguage=""] What alphabet is the user learning?
     */
    constructor(learningLanguage = "") {
        this.#appLanguage = Languages.getLanguageName(parseInt(localStorage.getItem("currentLanguage"))).toLowerCase();
        this.#currentLanguage = learningLanguage.toLowerCase();
        this.#soundPath = ALPHABET_SOUNDS_DIR + this.#currentLanguage + "/";

        //INCOMING: INSTANTIATION BLOB. TODO: Simplify if time allows...
        this.#loadLanguage(learningLanguage).then(alphabetText => {
            this.#loadLanguage(this.#appLanguage).then(appAlphabetText => {
                this.#Model = new DialogoModel(DialogoModel.MAIN_CACHE_NAME);
                this.#Model.fetchData(this.#soundPath + this.#currentLanguage + ".charmapping", false).then((charmapping) => {
                    this.#alphabet = alphabetText.split(",");
                    this.#appAlphabet = appAlphabetText.split(",");
                    this.#View = new AlphabetGameView(DialogoModel.ALPHABETGAMEVIEW_ID.replace("View", "Template"), 
                                                    this.#alphabet, this.#appAlphabet, this.#appLanguage, charmapping, 
                                                    this.#soundPath);
                    this.#View.onNavigatingToIndex(() => navigateToIndex());
                    this.#View.onNavigatingToLanguagePortal(() => this.#navigateToLanguagePortal());
                });
            })
        }).catch(error => console.error("Error loading alphabet:", error));

        /**Event handler for navigating to the index. */
        async function navigateToIndex() {
            await IndexController.createIndexController();
        }
    }

    /**Event handler for navigating to the Language Portal.
     * This will congratulate the user, 
     * send the new learnt alphabet to the server and
     * navigate to the Language Portal.
     */
    async #navigateToLanguagePortal() {
        let langStr = await LanguageManager.getTranslation("finishedalphabet");
        this.#View.createToast(langStr);

        let sessionID = sessionStorage.getItem(DialogoModel.SESSIONID_CACHE_NAME);
        let userName = sessionStorage.getItem(DialogoModel.USERNAME_CACHE_NAME);
        let languageID = parseInt(sessionStorage.getItem(DialogoModel.PREFERREDLANGUAGE_CACHE_NAME));
        let knownAlphabetVal = Languages.getLanguageValue(this.#currentLanguage);

        if(sessionID !== null) {
            let knownAlphabets = JSON.parse(sessionStorage.getItem(DialogoModel.KNOWNALPHABETS_CACHE_NAME));
            if(!knownAlphabets)
                knownAlphabets = {};
            knownAlphabets[this.#currentLanguage] = knownAlphabetVal;

            await this.#Model.putData(UPDATEUSER_URL,
                { sessionID: sessionID, userName: userName, 
                    preferredLanguage: languageID, 
                    knownAlphabets: knownAlphabets },
                "application/json", "", "", false);
        }

        let languagePortalCtrl = new LanguagePortalController(this.#currentLanguage);
    }

    /**Loads a language from an alphabet file.
     * @param {string} [language=""] The language for which to load the alphabet.
     * @returns A comma delimited string of characters that make up the alphabet.
     */
    async #loadLanguage(language = "") {
        console.log("Loading language: " + ALPHABET_DIR + language.toLowerCase() + ".alphabet");
        return fetch(ALPHABET_DIR + language + ".alphabet")
            .then(response => {
                if (response.ok) {
                    return response.text();
                }
                throw new Error('Network response was not ok.');
            })
            .then(text => {
                return text;
            })
            .catch(error => {
                console.error('Failure in AlphabetGameController.loadLanguage():', error);
            });
    }
}

const UPDATEUSER_URL = "https://${process.env.CONNECTION_DOMAIN}/user/";