import pg from "pg"
import SuperLogger from "./SuperLogger.mjs";
import User from "./user.mjs";
import Verb from "./Verb.mjs";
import fs from "fs";

// We are using an enviorment variable to get the db credentials 
if (process.env.DB_CONNECTIONSTRING == undefined)
    throw ("You forgot the db connection string");

//TODO: is the structure / design of the DBManager as good as it could be?

class DBManager {
    #credentials = {};
    #pool;

    constructor() {
        this.#pool = new pg.Pool({
            connectionString: process.env.DB_CONNECTIONSTRING.replace('${DB_PASSWORD}', process.env.DB_PASSWORD),
            ssl: {
                rejectUnauthorized: true,
                ca: fs.readFileSync('ca-central-1-bundle.pem').toString(),
            }
        });
    }

    /**Returns a user based on the username, or null if the user didn't exist.
     * @param {string} [userName=""] The user's username.
     */
    async getUser(userName="") {
        //let client = new pg.Client(this.#credentials);

        try {
            console.log("Trying to retrieve user from DB...");
            //await client.connect();
            let client = await this.#pool.connect();
            let result = await client.query('SELECT id, name, password, salt, preferredLanguage, alphabetsknown FROM "public"."Users" WHERE name = $1;', [userName]);
            if (result.rows.length > 0) {
                let userRow = result.rows[0];
                let user = new User(userRow.name, userRow.password, userRow.salt, userRow.preferredlanguage, JSON.parse(userRow.alphabetsknown));
                user.setId(userRow.id);
                return user;
            } else {
                console.log("Couldn't find user, returning null...");
                return null;
            }
        } catch (error) {
            console.error("storageManager.getUser: " + error);
        } finally {
            client.end(); //Always disconnect from the database.
        }
    }

    async updateUser(user) {
        //const client = new pg.Client(this.#credentials);

        try {
            //await client.connect();
            let client = await this.#pool.connect();
            const output = await client.query('Update "public"."Users" set "name" = $1, "password" = $2, "salt" = $3, preferredLanguage = $4, "alphabetsknown" = $5 where id = $6;', [user.getUsername(), user.getVerifier(), user.getSalt(), user.getPreferredLanguage(), user.getAlphabetsKnown(), user.getId()]);

            // Client.Query returns an object of type pg.Result (https://node-postgres.com/apis/result)
            // Of special interest is the rows and rowCount properties of this object.

            //TODO Did we update the user?

        } catch (error) {
            //TODO : Error handling?? Remember that this is a module separate from your server 
            console.error(error);
        } finally {
            client.end(); // Always disconnect from the database.
        }

        return user;
    }

    async deleteUser(user) {

        //const client = new pg.Client(this.#credentials);

        try {
            //await client.connect();
            let client = await this.#pool.connect();
            const output = await client.query('Delete from "public"."Users"  where id = $1;', [user.id]);

            //Client.Query returns an object of type pg.Result (https://node-postgres.com/apis/result)
            //Of special interest is the rows and rowCount properties of this object.

            //TODO: Did the user get deleted?

        } catch (error) {
            console.log(error);
        } finally {
            client.end(); // Always disconnect from the database.
        }

        return user;
    }

    async createUser(user) {
        //const client = new pg.Client(this.#credentials);

        try {
            //await client.connect();
            let client = await this.#pool.connect();
            const output = await client.query('INSERT INTO "public"."Users"("name", "password", "salt", preferredLanguage, "alphabetsknown") VALUES($1::Text, $2::Text, $3::Text, $4::Integer, $5::Text) RETURNING id;', [user.getUsername(), user.getVerifier(), user.getSalt(), user.getPreferredLanguage(), user.getAlphabetsKnown()]);

            // Client.Query returns an object of type pg.Result (https://node-postgres.com/apis/result)
            // Of special interest is the rows and rowCount properties of this object.

            if (output.rows.length == 1) {
                // We stored the user in the DB.
                user.setId(output.rows[0].id);
            }

        } catch (error) {
            console.error(error);
            //TODO : Error handling?? Remember that this is a module seperate from your server 
        } finally {
            client.end(); // Always disconnect from the database.
        }

        return user;
    }

    /**Gets absolutely all verbs stored in the DB. Probably not for production use :P 
     * @returns An object containing all the verbs in the DB.
    */
    async getVerbs() {
        //let client = new pg.Client(this.#credentials);
        let verbs = {}

        try {
            console.log("Trying to retrieve verbs from DB...");
            //await client.connect();
            let client = await this.#pool.connect();
            let result = await client.query('SELECT * FROM "public"."Verbs";');
            if (result.rows.length > 0) {
                result.rows.forEach(row => {
                    let verb = new Verb(row.name, JSON.parse(row.english), JSON.parse(row.italian), JSON.parse(row.russian));
                    verbs[row.name] = verb;
                });
                return verbs;
            } else {
                console.log("Couldn't find verbs, returning null...");
                return null;
            }
        } catch (error) {
            console.error("storageManager.getVerbs: " + error);
        } finally {
            client.end(); //Always disconnect from the database.
        }
    }
}

let connectionString = process.env.DB_CONNECTIONSTRING;
const actualConnectionString = connectionString.replace('${DB_PASSWORD}', process.env.DB_PASSWORD);
export default new DBManager(actualConnectionString);