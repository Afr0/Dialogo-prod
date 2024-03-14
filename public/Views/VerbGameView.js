import DialogoView from "./DialogoView.js";
import LanguageManager from "../LanguageManager.js";

/**View for the verb game. */
export default class VerbGameView extends DialogoView {
    #backBtn;

    #navigateToIndexEvent;
    #navigateToAssociateVerbsGameEvent;

    #verb = {};
    #appLanguageVerb = {};
    #currentVerb = 1;
    #BCP47;
    #speech;

    /**Constructs a new VerbGameView instance.
     * @param {string} [viewID=""] The id of the view to create.
     * @param {Object} verb The verb to display in this VerbGameView instance.
     * @param {Object} appLanguageVerb The verb in the app's language, to display under the verb.
     * @param {string} [BCP47=""] The BCP47 code of the verb's language, so it can be spoken.
     */
    constructor(viewID="", verb, appLanguageVerb, BCP47 = "") {
        super(viewID);

        this.#verb = verb;
        this.#appLanguageVerb = appLanguageVerb;
        this.#BCP47 = BCP47;
        
        this.#speech = new SpeechSynthesisUtterance();
        this.#speech.lang = this.#BCP47;

        this.#backBtn = document.getElementById("backBtn");
        LanguageManager.getTranslation("back").then((translation) => {
            this.#backBtn.textContent = translation;
        });
        
        this.#backBtn.addEventListener("click", async () => {
            await this.#navigateToIndexEvent();
        });

        let lblCurrentAppVerb = document.getElementById("lblCurrentAppVerb");
        lblCurrentAppVerb.innerText = this.#appLanguageVerb[this.#currentVerb.toString()];

        let lblCurrentVerb = document.getElementById("lblCurrentVerb");
        lblCurrentVerb.innerText = this.#verb[this.#currentVerb.toString()];

        this.#speech.text = this.#verb[this.#currentVerb];
        window.speechSynthesis.speak(this.#speech);

        lblCurrentVerb.addEventListener("click", async () => {

            if(this.#verb[this.#currentVerb.toString()] !== undefined)
                this.#currentVerb++;
            
            if(this.#verb[this.#currentVerb.toString()] == undefined) { //Don't try this at home, kids!
                await this.#navigateToAssociateVerbsGameEvent();
            }
            
            if(this.#verb[this.#currentVerb.toString()] !== undefined) {
                this.#speech.text = this.#verb[this.#currentVerb];
                window.speechSynthesis.speak(this.#speech);
            }

            lblCurrentVerb.innerText = this.#verb[this.#currentVerb.toString()];
            lblCurrentAppVerb.innerText = this.#appLanguageVerb[this.#currentVerb.toString()];
        });
    }

    onNavigatingToIndex(callback) {
        this.#navigateToIndexEvent = callback;
    }

    onNavigatingToAssociateVerbsGame(callback) {
        this.#navigateToAssociateVerbsGameEvent = callback;
    }
 }