import DialogoModel from "../DialogoModel.js";
import LoginView from "../Views/LoginView.js";
import LanguageManager, { Languages } from "../LanguageManager.js";
import IndexController from "../Controllers/IndexController.js";
//node-srp was giving me a LOT of grief because of its insistence on require instead of import,
//so ended up using this instead.
import * as SrpClient from "secure-remote-password/client.js";

/**
 * Controller for the Login view.
 */
export default class LoginController {
    #Model;
    #View;

    constructor() {
        this.#Model = new DialogoModel(DialogoModel.USER_CACHE_NAME);
        this.#View = new LoginView(DialogoModel.LOGINVIEW_ID.replace("View", "Template"));

        /**Event handler for navigating to the index. */
        async function navigateToIndex() {
            await IndexController.createIndexController();
        }

        this.#View.onNavigatingToIndex(() => navigateToIndex());

        let btnLogin = document.getElementById("btnLogin");

        btnLogin.addEventListener("click", async () => {
            let userName = document.getElementById("txtUsername").value;
            let password = document.getElementById("txtPassword").value;
            let clientEphemeral = SrpClient.generateEphemeral();

            this.#Model.postData(LOGIN_URL,
                { userName: userName, ephemeral: clientEphemeral.public }, 
                "application/json", "", "", false).then(response => {
                    response = JSON.parse(response);

                    let privateKey = SrpClient.derivePrivateKey(response.salt, userName, password);
                    localStorage.setItem("userName", userName);
                    this.#updateSessionStorage(userName, privateKey, null);
                    let clientSession;

                    try {
                        clientSession = SrpClient.deriveSession(clientEphemeral.secret, 
                            response.ephemeral, response.salt, userName, privateKey);
                    } catch(error) {
                        async () => {
                            this.#View.createToast(await LanguageManager.getTranslation("loginfailure"));
                            console.error(error);
                            return; //Let's guarantee that we're not trying to post with a null session.
                        }
                    }
                        
                    this.#Model.postData(PROOF_URL,
                        { userName: userName, proof: clientSession.proof }, 
                        "application/json", "", "", false).then(async (response) => {
                            response = JSON.parse(response);
                            this.#updateSessionStorage("", "", response);
                            let preferredLanguage = response.preferredLanguage;
                            console.log("Setting language to: " + Languages.getLanguageName(preferredLanguage));
                            //We are overriding the cache here because server settings represents
                            //previous user settings.
                            await LanguageManager.setLanguage(preferredLanguage, true);
                                
                            try {
                                SrpClient.verifySession(clientEphemeral.public, clientSession, 
                                    response.proof);

                                history.pushState({ userLoggedIn: true }, '', './index.html?userLoggedIn=true');
                                await IndexController.createIndexController();
                            } catch(error) {
                                this.#View.createToast(await LanguageManager.getTranslation("loginfailure"));
                                    console.error(error);
                            }
                        }).catch(async (error) => {
                            this.#View.createToast(await LanguageManager.getTranslation("loginfailure"));
                            console.error(error);
                        });
                }).catch(async (error) => {
                    LanguageManager.getTranslation("loginfailure").then((translation) => {
                        this.#View.createToast(translation)
                    });
                    console.error(error);
                });
        });
    }

    /**Updates sessionStorage with the response from the server.
     * @param {string} [userName=""] The user's username. May be an empty string.
     * @param {string} [privateKey=""] The user's private key. May be an empty string.
     * @param {Object} response The response from the server. May be null.
     */
    #updateSessionStorage(userName = "", privateKey = "", response = null) {
        if(userName !== "" && privateKey !== "") {
            sessionStorage.setItem(DialogoModel.USERNAME_CACHE_NAME, userName);
            sessionStorage.setItem(DialogoModel.SESSIONKEY_CACHE_NAME, privateKey);
        }

        if(response) {
            sessionStorage.setItem(DialogoModel.SESSIONID_CACHE_NAME, response.sessionID);
            sessionStorage.setItem(DialogoModel.PREFERREDLANGUAGE_CACHE_NAME, response.preferredLanguage);
            sessionStorage.setItem(DialogoModel.KNOWNALPHABETS_CACHE_NAME, 
                response.knownAlphabets);
        }
    }
}

const LOGIN_URL = "https://excited-sun-hat-fly.cyclic.app:8080/user/login";
const PROOF_URL = https://excited-sun-hat-fly.cyclic.app:8080/user/proof";
