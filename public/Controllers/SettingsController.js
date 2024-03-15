import DialogoModel from "../DialogoModel.js";
import SettingsView from "../Views/SettingsView.js";
import IndexController from "../Controllers/IndexController.js";
import LanguageManager from "../LanguageManager.js";
import { Languages } from "../LanguageManager.js";

/**
 * Controller for the Settings view.
 * A controller acts as a bridge between the Model and the View in the MVC pattern.
 * Using a Controller ensures that a Model is never aware of the View and vice
 * versa, ensuring separation of concerns.
 */
export default class SettingsController {
    #Model;
    #View;

    /**
     * Constructs an instance of SettingsController.
     */
    constructor() {
        this.#Model = new DialogoModel(DialogoModel.USER_CACHE_NAME);
        this.#View = new SettingsView(DialogoModel.SETTINGSVIEW_ID.replace("View", "Template"));
        this.#View.onNavigatingToIndex(() => this.#navigateToIndex());
        this.#View.onChangingLanguage((selectedLanguage) => this.#onChangeLanguage(selectedLanguage));
    }

    /**Event handler for navigating to the index. */
    async #navigateToIndex() {
        await IndexController.createIndexController();
    }

    async #onChangeLanguage(selectedLanguage = "") {
        let languageID = Languages.getLanguageValue(selectedLanguage);
        await LanguageManager.setLanguage(languageID, true);

        this.#View.setTranslations();

        let sessionID = sessionStorage.getItem(DialogoModel.SESSIONID_CACHE_NAME);
        let userName = sessionStorage.getItem(DialogoModel.USERNAME_CACHE_NAME);
        let knownAlphabets = sessionStorage.getItem(DialogoModel.KNOWNALPHABETS_CACHE_NAME);

        if(sessionID !== null) {
            await this.#Model.putData(SETTINGS_URL,
                { sessionID: sessionID, userName: userName, 
                    preferredLanguage: languageID,
                    knownAlphabets }, 
                "application/json", "", "", false);
        }
    }
}

const SETTINGS_URL = "https://" + DialogoModel.COMNECTION_DOMAIN + "/user/";