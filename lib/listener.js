"use strict";

const EventEmitter = require("events").EventEmitter;
const FORBIDDEN_CHARS = /[üäöÜÄÖ$@ß€*:.]|[^._\-/ :!#$%&()+=@^{}|~\p{Ll}\p{Lu}\p{Nd}]+/gu;
const CryptoJS = require("crypto-js");
const bcrypt = require("bcrypt");

class WebListener extends EventEmitter {
    constructor(ws, req, adapter) {
        super();
        this.adapter = adapter;
        this.req = req;
        this.ws = ws;
        this.ws.isClose = false;
        this.deviceID = null;
        this.isOnline = true;
        this.aesKey = "";
        this.aesKey_active = false;
        this.ip = this.req.socket.remoteAddress;
        //`${this.req.socket.remoteAddress}:${this.req.socket.remotePort}`
        ws.on("message", this.onData.bind(this));
        ws.on("close", this.onClose.bind(this));
        ws.on("error", this.onError.bind(this));
        ws.on("pong", this.onPong.bind(this));
    }

    /**
     * Ping/Pong
     */
    status() {
        return this.ws.isClose;
    }

    /**
     * Ping/Pong
     */
    onPong() {
        this.adapter.log_translator("debug", "replied_client", this.ip);
        this.isOnline = true;
        this.isOnlineCount = 0;
    }

    /**
     * Ping/Pong
     */
    onPing() {
        this.adapter.log_translator("debug", "ping_client", this.ip);
        if (!this.isOnline) {
            this.ws.terminate();
            this.adapter.clients[this.ip] && delete this.adapter.clients[this.ip];
        }
        this.isOnline = false;
        this.ws.ping();
    }

    /**
     * Closed
     */
    onClose() {
        const dev = this.deviceID ? this.deviceID : this.ip;
        this.adapter.log_translator("info", "disconnected", dev);
        this.deviceID && this.adapter.setState(`${this.deviceID}.connected`, false, true);
        this.ws.isAlive = false;
        this.ws.isClose = true;
    }

    /**
     *
     */
    async aes_check() {
        if (this.aesKey == "") {
            const check_key = await this.adapter.getStateAsync(`${this.deviceID}.aesKey`);
            if (check_key && check_key.val != null && check_key.val != "") {
                this.aesKey = check_key.val;
            }
        }
        const active_key = await this.adapter.getStateAsync(`${this.deviceID}.aesKey_active`);
        if (!active_key || active_key.val == null) {
            this.aesKey_active = active_key.val;
        }
    }

    /**
     * @param {string} data
     */
    onData(data) {
        let receive;
        let content;
        try {
            receive = JSON.parse(data);
            if (receive && receive["content"] != null && typeof receive["content"] === "string") {
                if (this.aesKey != "" || receive["type"] === "requestLogin") {
                    this.adapter.log.debug(`KEY: ${this.aesKey}`);
                    let aes = "";
                    if (receive["type"] === "requestLogin") {
                        aes = `tH8Lm-${receive["type"]}`; // Dummy Key
                    } else {
                        aes = `${this.aesKey}${receive["type"]}`;
                    }
                    try {
                        const bytes = CryptoJS.AES.decrypt(receive["content"], aes);
                        receive["content"] = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                        this.adapter.log.debug("Client(" + this.toString() + ") decrypt: " + JSON.stringify(receive));
                    } catch (error) {
                        this.onWrongAesKey();
                        this.adapter.log.warn(`Wrong AES Key - ${error}`);
                        return;
                    }
                } else {
                    if (this.aesKey == "" && receive["type"] != "requestLogin") {
                        this.adapter.log.warn(`Please enabled AES encryption`);
                        this.onWrongAesKey();
                        return;
                    }
                }
            }
            content = receive["content"];
        } catch (err) {
            this.adapter.log_translator("warn", "catch", `Receive - ${err}`);
            return;
        }
        this.adapter.log_translator("debug", "data_receive", this.ip, JSON.stringify(receive));
        if (!receive || receive["type"] == null || receive["type"] == "") {
            this.adapter.log_translator("info", "not_type", JSON.stringify(receive));
            return;
        }
        let devid = "";
        let index;
        if (content["deviceID"]) {
            devid = content["deviceID"].toString().replace(FORBIDDEN_CHARS, "_");
            index = this.adapter.devices.findIndex((id) => id.device === content["deviceID"].toString());
        }
        if (receive["type"] != "requestLogin" && !this.ws.isAlive) {
            this.adapter.log_translator("info", "wo_login", JSON.stringify(receive));
            return;
        }
        //this.adapter.log.info("TEST: " + JSON.stringify(receive));
        switch (receive["type"].toString()) {
            case "iobStateChangeRequest":
                if (content["stateID"] && this.adapter.subDatapoints[content["stateID"]]) {
                    this.adapter.setForeignState(content["stateID"], content["value"], false);
                }
                break;
            case "enumUpdateRequest":
                this.sendENUMS();
                break;
            case "subscribeToDataPoints":
                if (content["dataPoints"] && content["dataPoints"].length > 0) {
                    this.set_subscribe(content["dataPoints"]);
                }
                break;
            case "subscribeHistory":
                this.subscribeHistory(content);
                break;
            case "requestLogin":
                this.onLogin(index, devid, content);
                break;
            case "templateSettingCreate":
                this.createTemplates(content);
                break;
            case "requestTemplatesSettings":
                this.sendTemplates();
                break;
            case "uploadTemplateSetting":
                this.uploadTemplates(content);
                break;
            case "getTemplatesSetting":
                this.getTemplates(content);
                break;
            case "firstPingFromIob2":
                this.sendData({ type: this.adapter.answers.first });
                break;
            case "notification":
                this.sendNotify(content);
                break;
            default:
                this.adapter.log_translator("info", "Request_no_found", JSON.stringify(receive));
        }
    }

    /**
     * @param {object} content
     */
    async sendNotify(content) {
        const map = {
            type: this.adapter.answers.notify,
            onlySendNotification: content["onlySendNotification"],
            content: content["content"],
            date: new Date(),
        };
        this.sendData(map);
    }

    /**
     *
     */
    async onWrongAesKey() {
        const map = {
            type: this.adapter.answers.wrongAesKey,
        };
        this.sendData(map);
    }

    /**
     *
     */
    async setNewKey() {
        const map = {
            type: this.adapter.answers.setNewAes,
        };
        this.sendData(map);
    }

    /**
     * @param {object} content
     */
    subscribeHistory(content) {
        if (this.adapter.config.history && content["dataPoint"] && content["start"] > 0 && content["end"] > 0) {
            this.adapter.getHistory(
                this.adapter.config.history,
                {
                    id: content["dataPoint"],
                    start: content["start"],
                    end: content["end"],
                    aggregate: "none",
                    timeout: 2000,
                    addId: true,
                },
                (err, result) => {
                    if (err) this.adapter.log_translator("warn", "Error", err);
                    if (result) {
                        const map = {
                            type: this.adapter.answers.historyDataUpdate,
                            objectID: content["dataPoint"],
                            data: result,
                        };
                        this.sendData(map);
                    }
                },
            );
        }
    }

    /**
     * @param {object} content
     */
    async getTemplates(content) {
        if (content && content.name != null && content.name != "") {
            let device = null;
            let widget = null;
            let screen = null;
            const name = content["name"].toString().replace(FORBIDDEN_CHARS, "_");
            if (content["device"]) {
                const dev = await this.adapter.getStateAsync(`settings.${name}.devices`);
                if (dev != null && dev.val != null) {
                    device = { devices: dev.val };
                }
            }
            if (content["widget"]) {
                const wid = await this.adapter.getStateAsync(`settings.${name}.widgets`);
                if (wid != null && wid.val != null) {
                    widget = { widget: wid.val };
                }
            }
            if (content["screen"]) {
                const scr = await this.adapter.getStateAsync(`settings.${name}.screens`);
                if (scr != null && scr.val != null) {
                    screen = { screens: scr.val };
                }
            }
            const map = {
                type: this.adapter.answers.getTemp,
                ...device,
                ...widget,
                ...screen,
            };
            this.sendData(map);
        }
    }

    /**
     * @param {object} content
     */
    async uploadTemplates(content) {
        if (content && content.name != null && content.name != "") {
            const name = content["name"].toString().replace(FORBIDDEN_CHARS, "_");
            await this.adapter.createTemplates(name, content);
            //content = JSON.parse(JSON.stringify(content).replace(/\\/g, ""));
            //content = JSON.stringify(content).replace(/\\/g, "");
            //this.adapter.log.info("map: " + JSON.stringify(content));
            if (content["devices"] != null) {
                this.adapter.setState(`settings.${name}.devices`, content["devices"], true);
            }
            if (content["screens"] != null) {
                this.adapter.setState(`settings.${name}.screens`, content["screens"], true);
            }
            if (content["widgets"] != null) {
                this.adapter.setState(`settings.${name}.widgets`, content["widgets"], true);
            }
            const map = {
                type: this.adapter.answers.uploadTemp,
            };
            this.sendData(map);
        }
    }

    /**
     * @param {object} content
     */
    async createTemplates(content) {
        if (content && content.name != null && content.name != "") {
            const templatename = content["name"].toString().replace(FORBIDDEN_CHARS, "_");
            await this.adapter.createTemplates(templatename, content);
            const map = {
                type: this.adapter.answers.createTemp,
            };
            this.sendData(map);
        }
    }

    /**
     * sendTemplates to device
     */
    async sendTemplates() {
        let templates;
        const list = [];
        try {
            templates = await this.adapter.getChannelsOfAsync("settings");
        } catch (e) {
            this.adapter.log_translator("error", "catch", `sendTemplates - ${e.message}`);
        }
        if (templates && templates.length > 0) {
            for (const channel of templates) {
                if (channel && channel.common != null && channel.common.name != null) {
                    list.push(channel.common.name);
                }
            }
        }
        const map = {
            type: this.adapter.answers.requestTemp,
            settings: list,
        };
        this.sendData(map);
    }

    /**
     * @param {object} data
     */
    async set_subscribe(data) {
        const sendDP = [];
        for (const point of data) {
            const subs = {
                val: "",
                role: "",
            };
            const map = {
                type: "",
                objectID: "",
                value: "",
            };
            if (this.adapter.subDatapoints[point] && this.adapter.subDatapoints[point].val != null) {
                this.adapter.subscribeForeignStates(point);
                map.type = this.adapter.answers.answer;
                map.objectID = point;
                map.value = this.adapter.subDatapoints[point].val;
                sendDP.push(map);
                //this.sendData(map);
            } else {
                const obj = await this.adapter.getForeignObjectAsync(point);
                if (obj) {
                    this.adapter.subscribeForeignStates(point);
                    const value = await this.adapter.getForeignStateAsync(point);
                    subs.val = value && value.val != null ? value.val : "";
                    subs.role = obj.common && obj.common.role ? obj.common.role : "state";
                    this.adapter.subDatapoints[point] = subs;
                    this.adapter.log_translator("debug", "dp_subs", point);
                    map.type = this.adapter.answers.answer;
                    map.objectID = point;
                    map.value = value.val;
                    sendDP.push(map);
                    //this.sendData(map);
                } else {
                    this.adapter.log_translator("warn", "no_exists", point);
                }
            }
        }
        if (Object.keys(sendDP).length > 0) {
            this.sendData(sendDP);
        }
    }

    /**
     * @param {number|undefined|null} index
     * @param {string} devid
     * @param {object} content
     */
    async onLogin(index, devid, content) {
        let user;
        if (index != -1 && index != null) {
            user = this.adapter.devices[index];
            this.adapter.devices[index].socket = this.ws;
            this.adapter.devices[index].req = this.req;
            this.adapter.devices[index].ip = this.req.socket.remoteAddress;
            this.deviceID = this.adapter.devices[index].iob_id;
            this.adapter.subScribe(this.deviceID);
        } else {
            this.deviceID = devid;
            await this.adapter.createDevice(devid, content);
            const key = await this.adapter.setStateAsync(`${devid}.key`);
            const dev = {
                iob_id: devid,
                device: content["deviceID"].toString(),
                approved: false,
                connected: true,
                key: key != null && key.val != "" ? this.adapter.encrypt(key.val) : "",
                name: content["deviceName"].toString(),
                noPwdAllowed: false,
                socket: this.ws,
                req: this.req,
                ip: this.req.socket.remoteAddress,
            };
            this.adapter.devices.push(dev);
            user = this.adapter.devices[this.adapter.devices.length - 1];
        }
        const check_key = await this.adapter.getStateAsync(`${this.deviceID}.aesKey`);
        if (check_key && check_key.val != null && check_key.val != "") {
            this.aesKey = check_key.val;
        }
        const active_key = await this.adapter.getStateAsync(`${this.deviceID}.aesKey_active`);
        if (active_key && active_key.val != null) {
            this.aesKey_active = active_key.val;
        }
        this.adapter.clients[this.ip].device_ID = this.deviceID;
        this.adapter.clients[this.ip].ip_ID = this.ip;
        if (
            content.key != null &&
            user.key != null &&
            (await bcrypt.compare(content.key, user.key.toString())) &&
            user.noPwdAllowed &&
            user.approved
        ) {
            this.isApproved();
        } else if (
            content.user != null &&
            content.password != null &&
            content.user != "" &&
            content.password != "" &&
            user.approved &&
            !user.noPwdAllowed
        ) {
            const pw = await this.adapter.checkPasswordAsync(content.user, content.password);
            if (pw[0]) {
                this.isApproved();
            } else {
                this.adapter.log_translator("info", "wrong_pw", this.ip);
                this.isRejected();
            }
        } else if (!user.approved) {
            this.adapter.log_translator("info", "set_approve", `${this.deviceID}.approved`);
            this.isRejected(true);
        } else if (
            content.key != null &&
            user.key != null &&
            !(await bcrypt.compare(content.key, user.key.toString()))
        ) {
            this.adapter.log_translator("info", "key_invalid", this.ip);
            this.isRejected();
        } else if (!user.noPwdAllowed && (content.user != null || content.user == "")) {
            this.adapter.log_translator("info", "user_missing", this.ip);
            this.isRejected();
        } else if (!user.noPwdAllowed && (content.password != null || content.password == "")) {
            this.adapter.log_translator("info", "pw_missing", this.ip);
            this.isRejected();
        } else {
            this.adapter.log_translator("info", "login_error", this.ip);
            this.isRejected();
        }
    }

    /**
     * @param {boolean} [check=false]
     */
    isRejected(check) {
        this.sendData({ type: this.adapter.answers.loginDec });
        if (!check) {
            this.adapter.setState(`${this.deviceID}.date`, Date.now(), true);
            this.adapter.setState(`${this.deviceID}.connected`, false, true);
            this.adapter.setState(`${this.deviceID}.approved`, false, true);
            this.adapter.setState(`${this.deviceID}.key`, null, true);
        }
        this.ws.isAlive = false;
    }

    /**
     * Approved
     */
    isApproved() {
        this.adapter.log_translator("info", "login_suc", this.ip);
        this.adapter.setState(`${this.deviceID}.date`, Date.now(), true);
        this.adapter.setState(`${this.deviceID}.connected`, true, true);
        this.ws.isAlive = true;
        this.sendData({
            type: this.adapter.answers.approve,
            version: this.adapter.version,
        });
    }

    /**
     * @param {object} err
     */
    async onError(err) {
        this.adapter.log_translator("error", "Error", `Socket - ${err}`);
        this.deviceID && this.adapter.setState(`${this.deviceID}.connected`, false, true);
        this.ws.isAlive = false;
        this.ws.isClose = true;
    }

    /**
     * @param {object} data
     */
    async sendData(data) {
        this.adapter.log_translator("debug", "send_to", this.ip, this.ip, JSON.stringify(data));
        const send = {
            type: data["type"],
            content: "",
        };
        if (this.aesKey != "" && Object.keys(data).length > 1 && this.aesKey_active) {
            this.adapter.log.debug(`ENCRYPT KEY: ${this.aesKey}`);
            const aes = `${this.aesKey}${data["type"]}`;
            delete data["type"];
            send["content"] = CryptoJS.AES.encrypt(JSON.stringify(data), aes).toString();
        } else {
            delete data["type"];
            send["content"] = data ? data : {};
        }
        this.adapter.log_translator("debug", "send_to", this.ip, this.ip, JSON.stringify(send));
        this.ws.send(JSON.stringify(send));
    }

    /**
     * isAlive
     */
    isaliveRequest() {
        return this.ws.isAlive;
    }

    /**
     * Send enums
     */
    async sendENUMS() {
        const enum_hiobs = await this.adapter.getEnumsAsync("enum.hiob");
        if (enum_hiobs && enum_hiobs["enum.hiob"]) {
            const list = [];
            for (const enum_single in enum_hiobs["enum.hiob"]) {
                const listen = {
                    id: "",
                    name: "",
                    icon: "",
                    dataPointMembers: [],
                };
                const members = enum_hiobs["enum.hiob"][enum_single].common.members;
                listen.id = enum_single;
                listen.name = enum_hiobs["enum.hiob"][enum_single].common.name;
                listen.icon = enum_hiobs["enum.hiob"][enum_single].common.icon
                    ? enum_hiobs["enum.hiob"][enum_single].common.icon
                    : "";
                const dataPoints = [];
                if (members && members.length > 0) {
                    for (const member of members) {
                        const obj = await this.adapter.getForeignObjectAsync(member);
                        if (obj) {
                            const value = await this.adapter.getForeignStateAsync(member);
                            const subs = {
                                val: value && value.val != null && value.val != "" ? value.val : "",
                                role: obj.common && obj.common.role ? obj.common.role : "state",
                            };
                            this.adapter.subDatapoints[member] = subs;
                            dataPoints.push({
                                name: obj.common.name,
                                id: member,
                                role: subs.role,
                                otherDetails: obj.common.custom ? obj.common.custom : {},
                            });
                        } else {
                            this.adapter.log_translator("warn", "no_exists", member);
                        }
                    }
                }
                const map = {
                    id: enum_single,
                    name: enum_hiobs["enum.hiob"][enum_single].common.name,
                    icon: enum_hiobs["enum.hiob"][enum_single].common.icon
                        ? enum_hiobs["enum.hiob"][enum_single].common.icon
                        : "",
                    dataPointMembers: dataPoints,
                };
                list.push(map);
            }
            const enums_send = {
                type: this.adapter.answers.enumUpdate,
                enums: list,
            };
            this.sendData(enums_send);
        } else {
            this.adapter.log_translator("warn", "no_enums");
        }
    }
}

module.exports.WebListener = WebListener;
/*
import { WebSocketServer } from 'ws';
function heartbeat() {
  this.isAlive = true;
}
const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', function connection(ws) {
  ws.isAlive = true;
  ws.on('error', console.error);
  ws.on('pong', heartbeat);
});
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);
wss.on('close', function close() {
  clearInterval(interval);
});
*/
