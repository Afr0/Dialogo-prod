import DialogoView from "./DialogoView.js";
import LanguageManager from "../LanguageManager.js";

/**View for the Language Portal */
export default class LanguagePortalView extends DialogoView {
    #backBtn;
    #btnAlphabet;
    #btnVerbs;

    #navigateToIndexCallback;
    #navigateToAlphabetCallback;
    #navigateToVerbsCallback;

    constructor(viewID) {
        super(viewID);

        let title = document.getElementById("Header");
        LanguageManager.getTranslation("languageportal").then((translation) => {
            title.textContent = translation;
        });

        this.#backBtn = document.getElementById("backBtn");
        LanguageManager.getTranslation("back").then((translation) => {
            this.#backBtn.textContent = translation;
        });
        
        this.#backBtn.addEventListener("click", async () => {
            await this.#navigateToIndexCallback();
        });

        this.#btnAlphabet = document.getElementById("btnAlphabet");
        LanguageManager.getTranslation("practicethealphabet").then((translation) => {
            this.#btnAlphabet.textContent = translation;
        });

        this.#btnAlphabet.addEventListener("click", async () => {
            await this.#navigateToAlphabetCallback();
        });

        this.#btnVerbs = document.getElementById("btnVerbs");
        LanguageManager.getTranslation("learnverbs").then((translation) => {
            this.#btnVerbs.textContent = translation;
        });

        this.#btnVerbs.addEventListener("click", async () => {
            await this.#navigateToVerbsCallback();
        });
    }
    
    onNavigatingToIndex(callback) {
        this.#navigateToIndexCallback = callback;
    }

    onNavigatingToAlphabet(callback) {
        this.#navigateToAlphabetCallback = callback;
    }

    onNavigatingToVerbs(callback) {
        this.#navigateToVerbsCallback = callback;
    }
 }