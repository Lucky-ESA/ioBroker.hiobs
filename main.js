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
const bcrypt = require("bcrypt");
const { WebListener } = require("./lib/listener");
const helper = require("./lib/helper");
const tl = require("./lib/translator");
const format = require("util").format;
const { createServer } = require("https");
const fs = require("fs");
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
        this.on("message", this.onMessage.bind(this));
        this.on("unload", this.onUnload.bind(this));
        this.createEnum = helper.createEnum;
        this.createDataPoint = helper.createDataPoint;
        this.createForeignDataPoint = helper.createForeignDataPoint;
        this.loadKnownDevices = helper.loadKnownDevices;
        this.createDevice = helper.createDevice;
        this.subScribe = helper.subScribe;
        this.setNewStates = helper.setNewStates;
        this.createTemplates = helper.createTemplates;
        this.devices = [];
        this.clients = {};
        this.subDatapoints = {};
        this.all_enums = {};
        this.aesViewTimeout = {};
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
            notify: "notification",
            wrongAesKey: "wrongAesKey",
            setNewAes: "setNewAes",
            answer: "answerSubscribeToDataPoints",
        };
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        await this.checkDevices();
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
        if (this.config.useCert) {
            const server = createServer({
                cert: fs.readFileSync(this.config.certPath),
                key: fs.readFileSync(this.config.keyPath),
            });
            this.log_translator("info", "start_secure");
            this.ws = new WebSocketServer({ server: server, port: this.config.port });
        } else {
            this.log_translator("info", "start_server");
            this.ws = new WebSocketServer({ port: this.config.port });
        }
        this.ws.on("error", e => {
            this.log_translator("error", "Error", `WebSocket - ${e.message}`);
            this.setState("info.connection", false, true);
        });
        this.ws.on("close", data => {
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
                    content: {},
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
                        const status = this.clients[client.ip] ? this.clients[client.ip].status() : false;
                        this.log_translator("debug", "check_client", `${client.ip} - ${status}`);
                        check = true;
                        if (status) {
                            this.clients[client.ip].onPing();
                        }
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
     *
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
                this.aesViewTimeout[id] && clearTimeout(this.aesViewTimeout[id]);
            }
            callback();
        } catch {
            callback();
        }
    }

    // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
    // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
    /**
     * Is called if a subscribed object changes
     *
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
                                write: obj.common && obj.common.write ? obj.common.write : false,
                                read: obj.common && obj.common.read ? obj.common.read : false,
                            };
                            this.subDatapoints[member] = subs;
                        }
                    }
                }
                if (!isNew) {
                    member_list = [];
                }
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
            }
            this.log_translator("info", "enmu_del", id);

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
     *
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    async onStateChange(id, state) {
        if (state) {
            this.log_translator("debug", "state_change", ` - ${id} - ${state.val}`);
            if (!state.ack && id.startsWith("hiobs.")) {
                const command = id.split(".").pop();
                const dev_id = id.split(".")[2];
                const index = this.devices.findIndex(devices => devices.iob_id === dev_id);
                if (index != -1 && command != null && this.devices[index][command] != null) {
                    this.devices[index][command] = state.val;
                    if (command === "approved") {
                        this.setAckFlag(id);
                        if (state.val) {
                            const key = await this.genKey();
                            const map = {
                                type: this.answers.loginKey,
                                key: key[0],
                            };
                            if (this.clients[this.devices[index].ip]) {
                                this.devices[index].key = key[1];
                                this.setState(`${dev_id}.key`, this.encrypt(key[1]), true);
                                this.clients[this.devices[index].ip].sendData(map);
                            }
                        } else {
                            this.setState(`${dev_id}.key`, "", true);
                            if (this.clients[this.devices[index].ip]) {
                                this.setState(`${dev_id}.key`, null, true);
                                if (this.clients[this.devices[index].ip].isaliveRequest()) {
                                    this.clients[this.devices[index].ip].isRejected();
                                }
                            }
                        }
                    } else if (command === "aesKey_new") {
                        this.setAckFlag(id, { val: false });
                        if (this.clients[this.devices[index].ip]) {
                            this.setNewKey(this.clients[this.devices[index].ip], dev_id);
                        }
                    } else if (command === "aesKey_active") {
                        this.setAckFlag(id);
                        if (this.clients[this.devices[index].ip]) {
                            this.clients[this.devices[index].ip].aes_check();
                        }
                    } else if (command === "noPwdAllowed") {
                        this.setAckFlag(id);
                    } else if (command === "aesKey_view") {
                        this.setAckFlag(id, { val: false });
                        if (this.clients[this.devices[index].ip]) {
                            this.viewAesKey(dev_id);
                        }
                    }
                } else if (command === "sendNotification") {
                    this.setAckFlag(id);
                    const map = {
                        type: this.answers.notify,
                        onlySendNotification: false,
                        content: state.val,
                        date: new Date(),
                    };
                    if (this.clients[this.devices[index].ip]) {
                        this.clients[this.devices[index].ip].sendNotify(map);
                    } else {
                        this.log_translator("info", "device_offline", dev_id);
                        const notify = await this.getStateAsync(`${dev_id}.sendNotification_open`);
                        if (notify && notify.val != null) {
                            try {
                                const open_notify = JSON.parse(notify.val.toString());
                                open_notify.push(map);
                                this.setState(`${dev_id}.sendNotification_open`, JSON.stringify(open_notify), true);
                            } catch {
                                this.log_translator("warn", "cannot_parse");
                            }
                        }
                    }
                } else if (command === "sendNotification_open_del") {
                    this.setAckFlag(id, { val: false });
                    await this.setStateAsync(`${dev_id}.sendNotification_open`, JSON.stringify([]), true);
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
     * @param {string} id
     */
    async viewAesKey(id) {
        if (!this.aesViewTimeout[id]) {
            const state = await this.getStateAsync(`${id}.aesKey`);
            if (state != null && state.val != null) {
                if (state.val.toString().length > 6) {
                    const dec_shaAes = this.decrypt(state.val.toString());
                    await this.setStateAsync(`${id}.aesKey`, dec_shaAes, true);
                }
            } else {
                return;
            }
            this.aesViewTimeout[id] = this.setTimeout(async () => {
                const state = await this.getStateAsync(`${id}.aesKey`);
                if (state != null && state.val != null) {
                    if (state.val.toString().length === 6) {
                        const shaAes = this.encrypt(state.val.toString());
                        await this.setStateAsync(`${id}.aesKey`, shaAes, true);
                    }
                }
                this.aesViewTimeout[id] = null;
            }, 1000 * 60);
        }
    }

    /**
     * @param {object} id
     * @param {string} client
     */
    async setNewKey(id, client) {
        this.aesViewTimeout[client] && clearTimeout(this.aesViewTimeout[client]);
        const random_key = this.makekey(6, true);
        const shaAes = this.encrypt(random_key.toString());
        await this.setStateAsync(`${client}.aesKey`, shaAes, true);
        id.aes_check();
        id.setNewKey();
    }

    /**
     * Is called if a subscribed state changes
     *
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
    /**
     * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
     * Using this method requires "common.messagebox" property to be set to true in io-package.json
     *
     * @param {ioBroker.Message} obj
     */
    async onMessage(obj) {
        if (typeof obj === "object" && obj.message) {
            if (obj.command === "send") {
                if (obj.message && obj.message.uuid != null) {
                    const index = this.devices.findIndex(devices => devices.iob_id === obj.message.uuid);
                    if (index != -1) {
                        const map = {
                            type: this.answers.notify,
                            onlySendNotification: false,
                            content: obj.message.message,
                            date: new Date(),
                        };
                        this.clients[this.devices[index].ip].sendNotify(map);
                        if (obj.callback) {
                            this.sendTo(obj.from, obj.command, "Message received", obj.callback);
                        }
                    } else if (obj.message.uuid === "all") {
                        this.log.info("on work");
                    } else {
                        if (obj.callback) {
                            this.sendTo(obj.from, obj.command, "Error", obj.callback);
                        }
                    }
                } else {
                    if (obj.callback) {
                        this.sendTo(obj.from, obj.command, "Error received", obj.callback);
                    }
                }
            }
        }
    }

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
            if (this.loglevel !== "debug" && level === "debug") {
                loglevel = false;
            }
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
                }
                return tl.trans[text][this.lang];
            }
            return tl.trans["Unknown"][this.lang];
        } catch (e) {
            this.log.error(`try helper_translator: ${e} - ${text}`);
        }
    }

    async checkDevices() {
        const devices = await this.getDevicesAsync();
        const double_check_id = [];
        const config_devices = this.config.devices;
        let isDiff = false;
        for (const element of devices) {
            const id = element["_id"].split(".").pop();
            double_check_id.push(id);
            if (typeof id === "string" && id != null && Array.isArray(config_devices)) {
                if (!config_devices.toString().includes(id)) {
                    isDiff = true;
                    config_devices.push(id);
                }
            }
            const state = await this.getStateAsync(`${id}.aesKey`);
            if (state != null && state.val != null) {
                if (state.val.toString().length === 6) {
                    const shaAes = this.encrypt(state.val.toString());
                    await this.setStateAsync(`${element["_id"]}.aesKey`, shaAes, true);
                }
            }
        }
        this.log.debug(`${JSON.stringify(config_devices)}`);
        this.log.debug(`${JSON.stringify(double_check_id)}`);
        for (const element of config_devices) {
            if (!double_check_id.toString().includes(element)) {
                isDiff = true;
                break;
            }
        }
        if (isDiff) {
            this.log.info(`Changed device config - ${double_check_id}`);
            await this.extendForeignObjectAsync(`system.adapter.${this.namespace}`, {
                native: { devices: double_check_id },
            });
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
     * @param {boolean} woCharacters
     */
    makekey(length, woCharacters) {
        let result = "";
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-\\/&%$!;<>*+#";
        if (woCharacters) {
            characters = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";
        }
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(crypto.randomInt(0, charactersLength));
        }
        return result;
    }

    async genKey() {
        const key = this.makekey(512, false);
        const hashedKey = await bcrypt.hash(key, 5);
        return [key, hashedKey];
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = options => new Hiobs(options);
} else {
    // otherwise start the instance directly
    new Hiobs();
}
