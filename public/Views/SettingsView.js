import DialogoView from "./DialogoView.js";
import LanguageManager from "../LanguageManager.js";

export default class SettingsView extends DialogoView {
    #backBtn;
    #selectLanguage;

    #navigateToIndexCallback;
    #changeLanguageCallback;

    constructor(viewID) {
        super(viewID);

        this.setTranslations();

        this.#backBtn = document.getElementById("backBtn");
        LanguageManager.getTranslation("back").then((translation) => {
            this.#backBtn.textContent = translation;
        });
        
        this.#backBtn.addEventListener("click", async () => {
            await this.#navigateToIndexCallback();
        });

        this.#selectLanguage = document.getElementById("selectLanguage");
        this.#selectLanguage.addEventListener("change", async (event) => {
            if(event.target.value !== "Languages") {
                let selectedLanguage = event.target.value;
                await this.#changeLanguageCallback(selectedLanguage);
            }
        });
    }

    /**Applies translations to the textContent of the elements of this view. */
    setTranslations() {
        let title = document.getElementById("Header");
        LanguageManager.getTranslation("settings").then((translation) => {
            title.textContent = translation;
        });

        let lblSelectLangSetting = document.getElementById("lblSelectLanguage");
        LanguageManager.getTranslation("selectlangsetting").then((translation) => {
            lblSelectLangSetting.textContent = translation;
        });

        let optLanguages = document.getElementById("optLanguages");
        LanguageManager.getTranslation("languages").then((translation) => {
            optLanguages.textContent = translation;
        });
    }
    
    onNavigatingToIndex(callback) {
        this.#navigateToIndexCallback = callback;
    }

    onChangingLanguage(callback) {
        this.#changeLanguageCallback = callback;
    }
 }