import Languages from "../Languages.mjs";
import DBManager from "./storageManager.mjs";

class User {
    #id;
    #userName = "";
    #pwdHash = "";
    #salt = "";
    #preferredLanguage;
    #alphabetsKnown = {};

    /**
    * Sets this user's id.
    */
    setId(id = 0) {
      this.#id = id;
    }

    /**
    * Gets this user's id.
    * @returns The user's id.
    */
    getId() {
        return this.#id;
    }

    /**
     * Gets this user's username.
     * @returns The user's username.
     */
    getUsername() {
        return this.#userName;
    }

    /**
     * Gets this user's verifier.
     * @returns The user's verifier.
     */
    getVerifier() {
      return this.#pwdHash;
    }

    /**
     * Gets this user's salt.
     * @returns The user's salt.
     */
    getSalt() {
      return this.#salt;
    }

    /**
     * Gets this user's preferred language.
     * @returns The user's preferred language.
     */
    getPreferredLanguage() {
      return this.#preferredLanguage;
    }

    /**
    * Sets this user's preferred language.
    * @param {number} [preferredLanguage=2] The user's preferred language, defaults to English.
    */
    setPreferredLanguage(preferredLanguage = Languages.ImplementedLanguages.English) {
      this.#preferredLanguage = preferredLanguage;
    }

    /**
    * Sets this user's alphabetsKnown.
    * @param {object} [alphabetsKnown] The user's preferred language, defaults to English.
    */
    setAlphabetsKnown(alphabetsKnown = {}) {
      this.#alphabetsKnown = alphabetsKnown;
    }

    getAlphabetsKnown() {
      return JSON.stringify(this.#alphabetsKnown);
    }

    /**Constructs a new User instance. 
     * @param {string} userName The user's name.
     * @param {string} verifier The user's verifier.
     * @param {string} salt The user's salt.
     * @param {number} [preferredLanguage=1] The user's preferred language, defaults to English.
     * @param {{}} [knownAlphabets={}] The user's known alphabets, defaults to empty.
    */
    constructor(userName="", verifier="", salt="", 
                preferredLanguage = Languages.ImplementedLanguages.English, knownAlphabets = {}) {
        this.#userName = userName;
        this.#pwdHash = verifier;
        this.#salt = salt;
        this.#preferredLanguage = preferredLanguage;
        this.#alphabetsKnown = knownAlphabets;
    }

    async save() {
      //TODO: What happens if the DBManager fails to complete its task?
    
      //We know that if a user object dos not have the ID, then it cant be in the DB.
      if (this.#id == null)
        return await DBManager.createUser(this);
      else
        return await DBManager.updateUser(this);
    }

    /**Gets a user from the DB based on the username.
     *@param {string} [userName=""] The user's username.
     *@returns A new user instance or null if the user wasn't found.
     */
    static async getUser(userName="") {
      return await DBManager.getUser(userName);
    }
    
    delete() {
      //TODO: What happens if the DBManager fails to complete its task?
      DBManager.deleteUser(this);
    }
}

export default User;