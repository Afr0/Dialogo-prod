import DialogoView from "./DialogoView.js";
import LanguageManager from "../LanguageManager.js";

export default class IndexView extends DialogoView {
    #columnClass;
    
    #imgLogo;
    #btnLogin;
    #btnLogout;
    #btnNewUser;
    #btnStart;
    #btnSettings;
    #btnStats;

    #navigateToLoginEvent;
    #logoutEvent
    #navigateToSettingsEvent;
    #navigateToCreateUserEvent;
    #navigateToLanguageSelectionEvent;
    #navigateToStatsEvent;

    /**Constructs a new IndexView instance.
     * Please use IndexView.createInstance() to create an instance in a consumer class!
     * @param {string} [viewId=""] The id of the view to create.
     * @param {*} templateContent The template content for the view to insert into index.html.
     */
    constructor(viewID="") {
        super(viewID);

        this.#imgLogo = document.getElementById("imgLogo");
        this.#imgLogo.src = "data/images/logo.png";

        this.#btnStart = document.getElementById("btnStart");
        if (this.#btnStart) {
            this.#btnStart.addEventListener("click", () => {
                if (this.#navigateToLanguageSelectionEvent)
                    this.#navigateToLanguageSelectionEvent();
            });
        }

        this.#btnNewUser = document.getElementById("btnNewUser");
        if (this.#btnNewUser) {
            this.#btnNewUser.addEventListener("click", () => {
                if (this.#navigateToCreateUserEvent)
                    this.#navigateToCreateUserEvent();
            });
        }
        
        this.#btnLogin = document.getElementById("btnLogin");
        if (this.#btnLogin) {
            this.#btnLogin.addEventListener("click", () => {
                if (this.#navigateToLoginEvent)
                    this.#navigateToLoginEvent();
            });
        }

        this.#btnLogout = document.getElementById("btnLogout");
        if (this.#btnLogout) {
            this.#btnLogout.addEventListener("click", () => {
                if (this.#logoutEvent)
                    this.#logoutEvent();
            });
        }

        this.#btnSettings = document.getElementById("btnSettings");
        if(this.#btnSettings) {
            this.#btnSettings.addEventListener("click", () => {
                if(this.#navigateToSettingsEvent)
                    this.#navigateToSettingsEvent();
            });
        }

        this.#btnStats = document.getElementById("btnStats");
        if(this.#btnStats) {
            this.#btnStats.addEventListener("click", () => {
                if(this.#navigateToSettingsEvent)
                    this.#navigateToStatsEvent();
            });
        }

        this.setTranslations();
    }

    /**Sets translations for the HTML elements in this view. */
    setTranslations() {
        LanguageManager.getTranslation("settings").then((translation) => {
            this.#btnSettings.textContent = translation;
        });

        LanguageManager.getTranslation("logout").then((translation) => {
            this.#btnLogout.textContent = translation;
        });

        LanguageManager.getTranslation("login").then((translation) => {
            this.#btnLogin.textContent = translation;
        });

        LanguageManager.getTranslation("newuser").then((translation) => {
            this.#btnNewUser.textContent = translation;
        });

        LanguageManager.getTranslation("start").then((translation) => {
            this.#btnStart.textContent = translation;
        });

        LanguageManager.getTranslation("stats").then((translation) => {
            this.#btnStats.textContent = translation;
        });
    }
    
    /**Event handler for assigning a callback to the navigateToLanguageSelection event. */
    onNavigatingToLanguageSelection(callback) {
        this.#navigateToLanguageSelectionEvent = callback;
    }
    
    /**Event handler for assigning a callback to the navigateToLogin event. */
    onNavigatingToLogin(callback) {
        this.#navigateToLoginEvent = callback;
    }

    /**Event handler for assigning a callback to the logout event. */
    onLogout(callback) {
        this.#logoutEvent = callback;
    }

    /**Event handler for assigning a callback to the navigateToCreateUser event. */
    onNavigatingToCreateuser(callback) {
        this.#navigateToCreateUserEvent = callback;
    }

    /**Event handler for assigning a callback to the navigateToSettings event. */
    onNavigatingToSettings(callback) {
        this.#navigateToSettingsEvent = callback;
    }

    /**Event handler for assigning a callback to the navigateToStats event. */
    onNavigatingToStats(callback) {
        this.#navigateToStatsEvent = callback;
    }

    /**Switches the hidden properties of the login and logout buttons. */
    switchLoginBtn() {
        this.#btnLogout = document.getElementById("btnLogout");

        if(this.#btnLogout.hidden) {
            this.#btnLogout.hidden = false;
            this.#btnLogin.hidden = true;
        } else {
            this.#btnLogout.hidden = true;
            this.#btnLogin.hidden = false;
        }
    }

    /**Switches the hidden property of the stats button. */
    switchStatsBtn() {
        this.#btnStats = document.getElementById("btnStats");

        if(this.#btnStats.hidden)
            this.#btnStats.hidden = false;
        else
            this.#btnStats.hidden = true;
    }
 }