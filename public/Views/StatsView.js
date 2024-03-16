import DialogoView from "./DialogoView.js";
import LanguageManager from "../LanguageManager.js";

export default class StatsView extends DialogoView {
    #backBtn;

    #navigateToIndexCallback;

    constructor(viewID, knownAlphabets) {
        super(viewID);

        this.setTranslations(knownAlphabets);

        this.#backBtn = document.getElementById("backBtn");
        LanguageManager.getTranslation("back").then((translation) => {
            this.#backBtn.textContent = translation;
        });
        
        this.#backBtn.addEventListener("click", async () => {
            await this.#navigateToIndexCallback();
        });
    }

    /**Applies translations to the textContent of the elements of this view. 
     * @param { Object } knownAlphabets The user's known alphabets. 
    */
    setTranslations(knownAlphabets) {
        let title = document.getElementById("Header");
        LanguageManager.getTranslation("stats").then((translation) => {
            title.textContent = translation;
        });

        let hdrKnownAlphabets = document.getElementById("hdrKnownAlphabets");
        LanguageManager.getTranslation("alphabetsknown").then((translation) => {
            hdrKnownAlphabets.textContent = translation;
        });

        if(knownAlphabets) {
            let lblKnownAlphabets = document.getElementById("lblKnownAlphabets");
            let final = "";

            Object.entries(knownAlphabets).forEach(([key, value]) => {
                final += key.toString().charAt(0).toUpperCase() + key.slice(1) + ", ";
            });

            lblKnownAlphabets.textContent = final;
        }
    }
    
    onNavigatingToIndex(callback) {
        this.#navigateToIndexCallback = callback;
    }
 }