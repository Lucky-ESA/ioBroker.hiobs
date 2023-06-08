"use strict";

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");

// Load your modules here, e.g.:
const { WebSocket, WebSocketServer } = require("ws");
const crypto = require("crypto");
const { WebListener } = require("./lib/listener");
const helper = require("./lib/helper");
const tl = require("./lib/translator");
const format = require("util").format;
const restartTimeout = 1000;

class Hiobs extends utils.Adapter {
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: "hiobs",
        });
        this.on("ready", this.onReady.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        this.on("objectChange", this.onObjectChange.bind(this));
        // this.on("message", this.onMessage.bind(this));
        this.on("unload", this.onUnload.bind(this));
        this.createEnum = helper.createEnum;
        this.createDataPoint = helper.createDataPoint;
        this.createForeignDataPoint = helper.createForeignDataPoint;
        this.loadKnownDevices = helper.loadKnownDevices;
        this.createDevice = helper.createDevice;
        this.setNewStates = helper.setNewStates;
        this.createTemplates = helper.createTemplates;
        this.devices = [];
        this.clients = {};
        this.subDatapoints = {};
        this.all_enums = {};
        this.onlinecheck = null;
        this.history = null;
        this.autoRestartTimeout = null;
        this.lang = "de";
        this.loglevel = "info";
        this.answers = {
            first: "firstPingFromIob2",
            approve: "loginApproved",
            loginKey: "loginKey",
            change: "iobStateChanged",
            request: "iobStateChangeRequest",
            loginDec: "loginDeclined",
            enumUpdate: "enumUpdate",
            uploadTemp: "uploadTemplateSettingSuccess",
            requestTemp: "requestTemplatesSettings",
            createTemp: "templateSettingCreate",
            getTemp: "getTemplatesSetting",
            historyDataUpdate: "historyDataUpdate",
        };
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        this.setState("info.connection", false, true);
        this.config.port = parseInt(this.config.port.toString(), 10) || 8095;
        if (this.config.port <= 1024) {
            this.log_translator("info", "port_less", this.config.port);
            this.config.port = 8095;
        } else if (this.config.port > 65535) {
            this.log_translator("info", "port_greater", this.config.port);
            this.config.port = 8095;
        }

        const check_port = await this.getPortAsync(this.config.port);
        if (check_port !== this.config.port) {
            this.log_translator("warn", "port_use", this.config.port, check_port);
            this.config.port = check_port;
        }
        const loglevel = await this.getForeignStateAsync(`system.adapter.${this.namespace}.logLevel`);
        if (loglevel && loglevel.val) {
            this.loglevel = typeof loglevel.val == "string" ? loglevel.val : "info";
        }
        const obj = await this.getForeignObjectAsync("system.config");
        if (obj && obj.common && obj.common.language) {
            try {
                this.lang = obj.common.language === this.lang ? this.lang : obj.common.language;
            } catch (e) {
                this.log_translator("info", "try", `getForeignObjectAsync: ${e}`);
            }
        }
        const enum_check = await this.getForeignObjectAsync("enum.hiob");
        if (enum_check == null) {
            this.log_translator("info", "create_enum");
            await this.createEnum("enum.hiob");
            this.subscribeForeignObjects("enum.hiob.*");
        } else {
            this.subscribeForeignObjects("enum.hiob.*");
            await this.load_enums();
        }
        if (this.config.sql_instance) {
            this.history = this.config.sql_instance;
        } else if (this.config.history_instance) {
            this.history = this.config.history_instance;
        }
        await this.loadKnownDevices();
        this.connectAPP();
    }

    async connectAPP() {
        this.ws = new WebSocketServer({ port: this.config.port });
        this.ws.on("error", (e) => {
            this.log_translator("error", "Error", `WebSocket - ${e.message}`);
            this.setState("info.connection", false, true);
        });
        this.ws.on("close", (data) => {
            this.log_translator("info", "websocket_closed", data);
            this.setState("info.connection", false, true);
            if (this.ws.readyState === WebSocket.CLOSED) {
                this.restart_connectAPP();
            }
        });
        this.ws.on("connection", (ws, req) => {
            this.ws.clients.ip = req.socket.remoteAddress;
            ws.isAlive = true;
            ws.ip = req.socket.remoteAddress;
            ws.send(
                JSON.stringify({
                    type: this.answers.first,
                }),
            );
            if (this.clients[req.socket.remoteAddress]) {
                delete this.clients[req.socket.remoteAddress];
            }
            this.clients[req.socket.remoteAddress] = new WebListener(ws, req, this);
            this.interval_check();
        });
        this.setState("info.connection", true, true);
    }

    restart_connectAPP() {
        this.log_translator("info", "restarted");
        this.autoRestartTimeout && clearTimeout(this.autoRestartTimeout);
        this.autoRestartTimeout = setTimeout(() => {
            this.connectAPP();
        }, restartTimeout);
    }

    interval_check() {
        if (!this.onlinecheck) {
            this.onlinecheck = this.setInterval(async () => {
                let check = false;
                for (const client of this.ws.clients) {
                    if (client.readyState === WebSocket.OPEN) {
                        const status = this.clients[client.ip] ? this.clients[client.ip].status() : "";
                        this.log_translator("debug", "check_client", `${client.ip} - ${status}`);
                        check = true;
                        this.clients[client.ip].onPing();
                    }
                }
                if (!check) {
                    this.onlinecheck && this.clearInterval(this.onlinecheck);
                    this.onlinecheck = null;
                    this.clients = {};
                }
            }, 60 * 1000);
        }
    }

    async load_enums() {
        const enum_hiobs = await this.getEnumsAsync("enum.hiob");
        if (enum_hiobs && enum_hiobs["enum.hiob"]) {
            this.log_translator("info", "all_enums");
            for (const enum_single in enum_hiobs["enum.hiob"]) {
                this.all_enums[enum_single] = enum_hiobs["enum.hiob"][enum_single].common.members;
            }
        }
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    async onUnload(callback) {
        try {
            this.autoRestartTimeout && clearTimeout(this.autoRestartTimeout);
            this.ws && this.ws.close();
            this.onlinecheck && this.clearInterval(this.onlinecheck);
            const devices = await this.getDevicesAsync();
            for (const element of devices) {
                const id = element["_id"].split(".").pop();
                this.setState(`${id}.connected`, false, true);
            }
            callback();
        } catch (e) {
            callback();
        }
    }

    // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
    // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
    /**
     * Is called if a subscribed object changes
     * @param {string} id
     * @param {ioBroker.Object | null | undefined} obj
     */
    async onObjectChange(id, obj) {
        if (obj) {
            if (!this.all_enums[id]) {
                this.log_translator("info", "created_enum", id);
                this.all_enums[id] = obj.common.members;
            } else {
                const new_members = obj.common.members;
                const old_members = this.all_enums[id];
                let member_list = [];
                let isNew = false;
                for (const member of new_members) {
                    if (old_members.includes(member)) {
                        member_list.push(member);
                    } else {
                        this.log_translator("info", "new_member", `${id} - ${member}`);
                        member_list.push(member);
                        isNew = true;
                        const objs = await this.getForeignObjectAsync(member);
                        if (objs) {
                            const value = await this.getForeignStateAsync(member);
                            const subs = {
                                val: value && value.val != null ? value.val : "",
                                role: obj.common && obj.common.role ? obj.common.role : "state",
                            };
                            this.subDatapoints[member] = subs;
                        }
                    }
                }
                if (!isNew) member_list = [];
                for (const member of old_members) {
                    if (new_members.includes(member)) {
                        member_list.push(member);
                    } else {
                        this.log_translator("info", "del_member", `${id} - ${member}`);
                        delete this.subDatapoints[member];
                    }
                }
                this.all_enums[id] = member_list;
            }
        } else {
            if (id === "enmu.hiob") {
                this.log_translator("info", "all_enmu_del", id);
                this.all_enums = {};
                return;
            } else {
                this.log_translator("info", "enmu_del", id);
            }
            if (!this.all_enums[id]) {
                this.log_translator("info", "unknown_member", id);
            } else {
                if (this.all_enums[id].length === 0) {
                    this.log_translator("info", "unknown_member", id);
                } else {
                    for (const member of this.all_enums[id]) {
                        this.log_translator("info", "del_member", `${id} - ${member}`);
                        this.subDatapoints[member];
                    }
                }
                delete this.all_enums[id];
            }
        }
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state) {
            this.log_translator("debug", "state_change", `${id} - ${state.val}`);
            if (!state.ack && id.startsWith("hiobs.")) {
                const command = id.split(".").pop();
                const dev_id = id.split(".")[2];
                const index = this.devices.findIndex((devices) => devices.iob_id === dev_id);
                if (index != -1 && command != null && this.devices[index][command] != null) {
                    this.devices[index][command] = state.val;
                    this.setAckFlag(id);
                    if (command === "approved") {
                        if (state.val) {
                            const key = this.makekey(512);
                            const map = {
                                type: this.answers.loginKey,
                                key: key,
                            };
                            if (this.clients[this.devices[index].ip]) {
                                this.devices[index].key = key;
                                this.setState(`${dev_id}.key`, this.decrypt(key), true);
                                this.clients[this.devices[index].ip].sendData(map);
                            }
                        } else {
                            if (this.clients[this.devices[index].ip]) {
                                this.setState(`${dev_id}.key`, null, true);
                                if (this.clients[this.devices[index].ip].isaliveRequest()) {
                                    this.clients[this.devices[index].ip].isRejected();
                                }
                            }
                        }
                    }
                }
            } else if (this.subDatapoints[id] && this.subDatapoints[id].val != state.val) {
                this.subDatapoints[id].val = state.val;
                this.sendNewValueOnAllClients(id, state);
            }
        } else {
            this.log_translator("debug", "state_delete", `${id}`);
            if (this.subDatapoints[id]) {
                delete this.subDatapoints[id];
            }
        }
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    sendNewValueOnAllClients(id, state) {
        const value = state && state.val != null ? state.val : "";
        for (const client of this.ws.clients) {
            if (client.readyState === WebSocket.OPEN && client.ip && this.clients[client.ip] != null) {
                const map = {
                    type: this.answers.change,
                    objectID: id,
                    value: value,
                };
                this.clients[client.ip].sendData(map);
            }
        }
    }

    // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
    //  * @param {ioBroker.Message} obj
    //  */
    // onMessage(obj) {
    //     if (typeof obj === "object" && obj.message) {
    //         if (obj.command === "send") {
    //             // e.g. send email or pushover or whatever
    //             this.log.info("send command");

    //             // Send response in callback if required
    //             if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
    //         }
    //     }
    // }

    /**
     * @param {string} level
     * @param {string} text
     * @param {string | number} [merge_1=null]
     * @param {string | number | boolean} [merge_2=null]
     * @param {string | number} [merge_3=null]
     */
    log_translator(level, text, merge_1, merge_2, merge_3) {
        try {
            let loglevel = true;
            if (this.loglevel !== "debug" && level === "debug") loglevel = false;
            if (loglevel) {
                if (tl.trans[text] != null) {
                    if (merge_3) {
                        this.log[level](format(tl.trans[text][this.lang], merge_1, merge_2, merge_3));
                    } else if (merge_2) {
                        this.log[level](format(tl.trans[text][this.lang], merge_1, merge_2));
                    } else if (merge_1) {
                        this.log[level](format(tl.trans[text][this.lang], merge_1));
                    } else {
                        this.log[level](tl.trans[text][this.lang]);
                    }
                } else {
                    this.log.warn(format(tl.trans["Cannot find translation"][this.lang], text));
                }
            }
        } catch (e) {
            this.log.error(`try log_translator: ${e} - ${text} - ${level}`);
        }
    }

    /**
     * @param {string} text
     * @param {string | number} [merge=null]
     * @param {string | number} [merge_1=null]
     */
    helper_translator(text, merge, merge_1) {
        try {
            if (tl.trans[text][this.lang]) {
                if (merge_1) {
                    return format(tl.trans[text][this.lang], merge, merge_1);
                } else if (merge) {
                    return format(tl.trans[text][this.lang], merge);
                } else {
                    return tl.trans[text][this.lang];
                }
            } else {
                return tl.trans["Unknown"][this.lang];
            }
        } catch (e) {
            this.log.error(`try helper_translator: ${e} - ${text}`);
        }
    }

    /**
     * @param {string} id
     * @param {object} [value=null]
     */
    async setAckFlag(id, value) {
        try {
            if (id) {
                this.setState(id, {
                    ack: true,
                    ...value,
                });
            }
        } catch (e) {
            this.log_translator("error", "try", `setAckFlag: ${e}`);
        }
    }

    /**
     * @param {number} length
     */
    makekey(length) {
        let result = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-\\/&%$!;<>*+#";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(crypto.randomInt(0, charactersLength));
        }
        return result;
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new Hiobs(options);
} else {
    // otherwise start the instance directly
    new Hiobs();
}
