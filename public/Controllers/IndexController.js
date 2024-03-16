import DialogoModel from "../DialogoModel.js";
import IndexView from "../Views/IndexView.js";
import LanguageManager from "../LanguageManager.js";
import { Languages } from "../LanguageManager.js";
import CreateUserController from "../Controllers/CreateUserController.js";
import LoginController from "./LoginController.js";
import LanguageStartController from "./LanguageStartController.js";
import TemplateManager from "../TemplateManager.js";
import SettingsController from "./SettingsController.js";
import StatsController from "./StatsController.js";
import DialogoView from "../Views/DialogoView.js";

/**
 * Controller for the Index view.
 * A controller acts as a bridge between the Model and the View in the MVC pattern.
 * Using a Controller ensures that a Model is never aware of the View and vice
 * versa, ensuring separation of concerns.
 */
export default class IndexController {
    #Model;
    #View;

    static loginController;
    static createUserController;

    /**
     * Constructs an instance of IndexController.
     * Consumers should use IndexController.createIndexController()
     * @param {DialogoModel} mainModel The model for this controller.
     * @param {*} mainView The view for this controller.
     */
    constructor(mainModel = new DialogoModel(DialogoModel.MAIN_CACHE_NAME), mainView) {
        this.#Model = mainModel;
        this.#View = mainView;
        this.#View.onLogout(async () => await this.#logout(this.#View));
    }

    /**Static constructor for IndexController. */
    static async createIndexController() {
        let urlParams = new URLSearchParams(window.location.search);

        let appModel = new DialogoModel(DialogoModel.MAIN_CACHE_NAME);
        let appView = new IndexView(DialogoModel.INDEXVIEW_ID.replace("View", "Template"));
        appView.onNavigatingToLogin(() => navigateToLogin());
        appView.onNavigatingToCreateuser(() => navigateToCreateUser());
        appView.onNavigatingToLanguageSelection(() => navigateToLanguageSelection());
        appView.onNavigatingToSettings(() => navigateToSettings());
        appView.onNavigatingToStats(() => navigateToStats());
        
        //Since this is for index.html, let's set and cache the default language
        //and assume the user hasn't changed it. We do not override - the only
        //page that gets to override the currently set language is the
        //language settings page.
        await LanguageManager.setLanguage(Languages.ImplementedLanguages.English);
        
        if(urlParams.get("userLoggedIn") === "true") {
            appView.createToast(await LanguageManager.getTranslation("userloggedin"));
            appView.switchLoginBtn();
            appView.switchStatsBtn();
        }
        
        if(urlParams.get("userCreated") === "true")
            appView.createToast(await LanguageManager.getTranslation("newusercreated"));
        if(urlParams.get("userDeleted") === "true")
            appView.createToast(await LanguageManager.getTranslation("userdeleted"));
        
        let appController = new IndexController(appModel, appView);

        function navigateToLanguageSelection() {
            let languageStartController = new LanguageStartController();
        }

        function navigateToCreateUser() {
            let createUserController = new CreateUserController();
        }
    
        function navigateToLogin() {
            let loginController = new LoginController();
        }

        function navigateToSettings() {
            let settingsController = new SettingsController();
        }

        function navigateToStats() {
            let statsController = new StatsController();
        }
    }

    /**Logs the user out and resets the view.
     * @param {DialogoView} view The view to reset. 
     */
    async #logout(view) {
        let userName = sessionStorage.getItem("userName");
        let sessionID = sessionStorage.getItem("sessionID");
        await this.#Model.postData(LOGOUT_URL,
            { userName: userName, 
            sessionID: sessionID }, 
            "application/json", "", "", false).then(async () => {
                LanguageManager.getTranslation("userloggedout").then(async (caption) => {
                    view.createToast(caption);
                    view.switchLoginBtn();
                    this.#Model.deleteSession();

                    //Reset app language when logging out.
                    await LanguageManager.setLanguage(Languages.ImplementedLanguages.English, true);
                    view.setTranslations();
                });
            });
    }
}

const LOGOUT_URL = "./user/logout";

//Ensure the Controller is initialized when the webpage has been
//loaded.
document.addEventListener("DOMContentLoaded", async function() {
    await TemplateManager.initializeTemplates();
    await IndexController.createIndexController();

    const registerServiceWorker = async () => {
        if ("serviceWorker" in navigator) {
            try {
                const registration = await navigator.serviceWorker.register("/serviceWorker.js", {
                    scope: "/",
                });
                if (registration.installing)
                    console.log("Service worker installing");
                else if (registration.waiting)
                    console.log("Service worker installed");
                else if (registration.active)
                    console.log("Service worker active");
            } catch (error) {
                console.error(`Registration failed with ${error}`);
            }
        }
    };
    
    registerServiceWorker();
});