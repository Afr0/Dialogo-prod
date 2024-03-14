import DialogoView from "./DialogoView.js";
import LanguageManager from "../LanguageManager.js";

export default class LoginView extends DialogoView {
    #backBtn;
    #btnLogin;

    #navigateToIndexCallback;

    constructor(viewID) {
        super(viewID);

        //TODO if time: make all elements in a view available in a list/array?
        //So you could change the text of the H1 without knowledge of its ID...
        let title = document.getElementById("Header");
        this.#btnLogin = document.getElementById("btnLogin");
        LanguageManager.getTranslation("login").then((translation) => {
            title.textContent = translation;
            this.#btnLogin.textContent = translation;
        });
        
        let lblUsername = document.getElementById("lblUsername");
        let lblPassword = document.getElementById("lblPassword");
        LanguageManager.getTranslation("username").then((translation) => {
            lblUsername.textContent = translation;
        });
        LanguageManager.getTranslation("password").then((translation) => {
            lblPassword.textContent = translation;
        });

        this.#backBtn = document.getElementById("backBtn");
        LanguageManager.getTranslation("back").then((translation) => {
            this.#backBtn.textContent = translation;
        });
        
        this.#backBtn.addEventListener("click", async () => {
            await this.#navigateToIndexCallback();
        });
    }

    onNavigatingToIndex(callback) {
        this.#navigateToIndexCallback = callback;
    }
 }