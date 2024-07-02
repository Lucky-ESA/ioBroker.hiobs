// @ts-nocheck
/* eslint-disable no-undef */
"use strict";

if (typeof goog !== "undefined") {
    goog.provide("Blockly.JavaScript.Sendto");
    goog.require("Blockly.JavaScript");
}

// --- SendTo notification
Blockly.Words["no_instance_found"] = {
    en: "No instance found",
    de: "Keine Instanz gefunden",
    ru: "Не найден",
    pt: "Nenhuma instância encontrada",
    nl: "Geen instantie gevonden",
    fr: "Aucune instance trouvée",
    it: "Nessun caso trovato",
    es: "No hay caso encontrado",
    pl: "Brak",
    uk: "Не знайдено",
    "zh-cn": "未找到实例",
};
Blockly.Words["hiob"] = {
    en: "HioB",
    de: "HioB",
    ru: "HioB",
    pt: "HioB",
    nl: "HioB",
    fr: "HioB",
    it: "HioB",
    es: "HioB",
    pl: "HioB",
    uk: "HioB",
    "zh-cn": "顿",
};
Blockly.Words["hiob_message"] = {
    en: "Notify message",
    de: "Nachricht senden",
    ru: "Уведомление",
    pt: "Notifique a mensagem",
    nl: "Bericht aanmelden",
    fr: "Message d'alerte",
    it: "Invia messaggio",
    es: "Notificar el mensaje",
    pl: "Powiadomienie",
    uk: "Повідомлення",
    "zh-cn": "通知消息",
};
Blockly.Words["hiob_log"] = {
    en: "Loglevel",
    de: "Loglevel",
    ru: "Войти",
    pt: "Nível de log",
    nl: "Loglevel",
    fr: "Loglevel",
    it: "Livello di registro",
    es: "Nivel de estudios",
    pl: "Logos",
    uk: "Увійти",
    "zh-cn": "后勤问题",
};
Blockly.Words["hiob_log_none"] = {
    en: "none",
    de: "kein",
    ru: "нет",
    pt: "nenhum",
    nl: "niemand",
    fr: "aucun",
    it: "nessuno",
    es: "ninguno",
    pl: "żaden",
    uk: "немає",
    "zh-cn": "无",
};
Blockly.Words["hiob_log_info"] = {
    en: "info",
    de: "info",
    ru: "инфо",
    pt: "info",
    nl: "info",
    fr: "info",
    it: "info",
    es: "info",
    pl: "info",
    uk: "контакти",
    "zh-cn": "导 言",
};
Blockly.Words["hiob_log_debug"] = {
    en: "debug",
    de: "debug",
    ru: "дебаг",
    pt: "depuração",
    nl: "debug",
    fr: "debug",
    it: "debug",
    es: "debug",
    pl: "debug",
    uk: "напляскване",
    "zh-cn": "黑暗",
};
Blockly.Words["hiob_log_warn"] = {
    en: "warn",
    de: "warnen",
    ru: "предупреждение",
    pt: "avisem",
    nl: "waarschuwing",
    fr: "prévenir",
    it: "avvertire avvertire",
    es: "warn",
    pl: "ostrzegać",
    uk: "про нас",
    "zh-cn": "战争",
};
Blockly.Words["hiob_log_error"] = {
    en: "error",
    de: "fehler",
    ru: "ошибка",
    pt: "erro",
    nl: "error",
    fr: "erreur",
    it: "errore",
    es: "error",
    pl: "błąd",
    uk: "про нас",
    "zh-cn": "错误",
};
Blockly.Words["hiob_tooltip"] = {
    en: "Send a message to a phone",
    de: "Sende eine Nachricht an ein Telefon",
    ru: "Отправить сообщение на телефон",
    pt: "Enviar mensagem para um telefone",
    nl: "Een bericht naar een telefoon sturen",
    fr: "Envoyer un message à un téléphone",
    it: "Invia un messaggio a un telefono",
    es: "Enviar un mensaje a un teléfono",
    pl: "Wyślij wiadomość do telefonu",
    uk: "Надіслати повідомлення на телефон",
    "zh-cn": "向电话发送消息",
};
Blockly.Words["hiob_help"] = {
    en: "https://github.com/moba15/ioBroker.hiob/blob/main/docs/en/README.md",
    de: "https://github.com/moba15/ioBroker.hiob/blob/main/docs/de/README.md",
    ru: "https://github.com/moba15/ioBroker.hiob/blob/main/docs/en/README.md",
    pt: "https://github.com/moba15/ioBroker.hiob/blob/main/docs/en/README.md",
    nl: "https://github.com/moba15/ioBroker.hiob/blob/main/docs/en/README.md",
    fr: "https://github.com/moba15/ioBroker.hiob/blob/main/docs/en/README.md",
    it: "https://github.com/moba15/ioBroker.hiob/blob/main/docs/en/README.md",
    es: "https://github.com/moba15/ioBroker.hiob/blob/main/docs/en/README.md",
    pl: "https://github.com/moba15/ioBroker.hiob/blob/main/docs/en/README.md",
    uk: "https://github.com/moba15/ioBroker.hiob/blob/main/docs/en/README.md",
    "zh-cn": "https://github.com/moba15/ioBroker.hiob/blob/main/docs/en/README.md",
};
Blockly.Words["hiob_choose"] = {
    en: "All phones",
    de: "Alle Telefone",
    ru: "Все телефоны",
    pt: "Todos os telefones",
    nl: "Alle telefoons",
    fr: "Tous les téléphones",
    it: "Tutti i telefoni",
    es: "Todos los teléfonos",
    pl: "Wszystkie telefony",
    uk: "Всі телефони",
    "zh-cn": "所有电话",
};
Blockly.Words["hiob_id"] = {
    en: "Phones ID",
    de: "Telefon-ID",
    ru: "Телефоны ID",
    pt: "ID de telefones",
    nl: "Telefoon ID",
    fr: "Numéro de téléphone",
    it: "ID telefoni",
    es: "ID de teléfonos",
    pl: "Identyfikator telefonów",
    uk: "Ідентифікатор телефону",
    "zh-cn": "电话号码",
};
Blockly.Words["hiob_title"] = {
    en: "Title",
    de: "Titel",
    ru: "Название",
    pt: "Título",
    nl: "Titel",
    fr: "Titre",
    it: "Titolo",
    es: "Título",
    pl: "Tytuł",
    uk: "Головна",
    "zh-cn": "标题",
};
Blockly.Words["hiob_group"] = {
    en: "Group",
    de: "Gruppe",
    ru: "Группа",
    pt: "Grupo",
    nl: "Groep",
    fr: "Groupe",
    it: "Gruppo",
    es: "Grupo",
    pl: "Grupa",
    uk: "Група",
    "zh-cn": "组",
};
Blockly.Words["hiob_lock"] = {
    en: "discarded",
    de: "verworfen",
    ru: "выброшенные",
    pt: "descartado",
    nl: "weggegooid",
    fr: "rejeté",
    it: "scartato",
    es: "descartado",
    pl: "wyrzucić",
    uk: "знежирений",
    "zh-cn": "丢弃",
};
Blockly.Words["hiob_argb"] = {
    en: "Color ARGB",
    de: "Farbe ARGB",
    ru: "Цвет ARGB",
    pt: "Cor ARGB",
    nl: "Kleur ARGB",
    fr: "Couleur ARGB",
    it: "Colore ARGB",
    es: "Color ARGB",
    pl: "Kolor ARGB",
    uk: "Колір ARGB",
    "zh-cn": "颜色 ARGB",
};
Blockly.Words["hiob_message_id"] = {
    en: "Message Id",
    de: "Nachricht Id",
    ru: "Сообщение Id",
    pt: "Mensagem Id",
    nl: "Bericht-id",
    fr: "Numéro de message",
    it: "Messaggio",
    es: "Mensaje Id",
    pl: "Identyfikator wiadomości",
    uk: "Повідомлення Id",
    "zh-cn": "信件编号",
};
Blockly.Sendto.blocks["hiob_notify"] =
    '<block type="hiob_notify">' +
    '     <field name="INSTANCE"></field>' +
    '     <field name="HIOB_DEVICES"></field>' +
    '     <value name="TITLE">' +
    '         <shadow type="text">' +
    '             <field name="TEXT">title</field>' +
    "         </shadow>" +
    "     </value>" +
    '     <value name="MESSAGE">' +
    '         <shadow type="text">' +
    '             <field name="TEXT">message</field>' +
    "         </shadow>" +
    "     </value>" +
    '     <value name="GROUP">' +
    '         <shadow type="logic_boolean">' +
    '             <field name="BOOL">FALSE</field>' +
    "         </shadow>" +
    "     </value>" +
    '     <value name="LOCK">' +
    '         <shadow type="logic_boolean">' +
    '             <field name="BOOL">FALSE</field>' +
    "         </shadow>" +
    "     </value>" +
    '     <value name="ARGB">' +
    '         <shadow type="text">' +
    '             <field name="TEXT">FFFFFFFF</field>' +
    "         </shadow>" +
    "     </value>" +
    '     <value name="MESSAGE_ID">' +
    '         <shadow type="math_number">' +
    '             <field name="NUM">1</field>' +
    "         </shadow>" +
    "     </value>" +
    "</block>";

Blockly.Blocks["hiob_notify"] = {
    init: function () {
        const options = [];
        const options_user = [[Blockly.Translate("hiob_choose"), "all"]];
        if (typeof main !== "undefined" && main.instances) {
            for (let i = 0; i < main.instances.length; i++) {
                const m = main.instances[i].match(/^system.adapter.hiobs.(\d+)$/);
                if (m) {
                    const n = parseInt(m[1], 10);
                    options.push(["hiobs." + n, "." + n]);
                    if (main.objects[main.instances[i]].native.devices) {
                        for (const s of main.objects[main.instances[i]].native.devices) {
                            options_user.push([n + "." + s, s]);
                        }
                    }
                }
            }
        }
        if (Object.keys(options).length == 0) {
            options.push([Blockly.Translate("no_instance_found"), ""]);
            for (let u = 0; u <= 4; u++) {
                options.push(["hiobs." + u, "." + u]);
            }
        }
        this.appendDummyInput("INSTANCE")
            .appendField(Blockly.Translate("hiob"))
            .appendField(new Blockly.FieldDropdown(options), "INSTANCE");

        this.appendDummyInput("HIOB_DEVICES")
            .appendField(Blockly.Translate("hiob_id"))
            .appendField(new Blockly.FieldDropdown(options_user), "HIOB_DEVICES");

        this.appendValueInput("MESSAGE").setCheck("String").appendField(Blockly.Translate("hiob_message"));
        this.appendValueInput("TITLE").setCheck("String").appendField(Blockly.Translate("hiob_title"));
        this.appendValueInput("GROUP").setCheck("Boolean").appendField(Blockly.Translate("hiob_group"));
        this.appendValueInput("LOCK").setCheck("Boolean").appendField(Blockly.Translate("hiob_lock"));
        this.appendValueInput("ARGB").setCheck("String").appendField(Blockly.Translate("hiob_argb"));
        this.appendValueInput("MESSAGE_ID").setCheck("Number").appendField(Blockly.Translate("hiob_message_id"));
        this.appendDummyInput("LOG")
            .appendField(Blockly.Translate("hiob_log"))
            .appendField(
                new Blockly.FieldDropdown([
                    [Blockly.Translate("hiob_log_none"), ""],
                    [Blockly.Translate("hiob_log_info"), "log"],
                    [Blockly.Translate("hiob_log_debug"), "debug"],
                    [Blockly.Translate("hiob_log_warn"), "warn"],
                    [Blockly.Translate("hiob_log_error"), "error"],
                ]),
                "LOG",
            );

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setColour(Blockly.Sendto.HUE);
        this.setTooltip(Blockly.Translate("hiob_tooltip"));
        this.setHelpUrl(Blockly.Translate("hiob_help"));
    },
};

Blockly.JavaScript["hiob_notify"] = function (block) {
    const dropdown_instance = block.getFieldValue("INSTANCE");
    const value_uuid_id = block.getFieldValue("HIOB_DEVICES");
    const logLevel = block.getFieldValue("LOG");
    const value_message = Blockly.JavaScript.valueToCode(block, "MESSAGE", Blockly.JavaScript.ORDER_ATOMIC);
    const value_title = Blockly.JavaScript.valueToCode(block, "TITLE", Blockly.JavaScript.ORDER_ATOMIC);
    const value_group = Blockly.JavaScript.valueToCode(block, "GROUP", Blockly.JavaScript.ORDER_ATOMIC);
    const value_lock = Blockly.JavaScript.valueToCode(block, "LOCK", Blockly.JavaScript.ORDER_ATOMIC);
    const value_argb = Blockly.JavaScript.valueToCode(block, "ARGB", Blockly.JavaScript.ORDER_ATOMIC);
    const value_message_id = Blockly.JavaScript.valueToCode(block, "MESSAGE_ID", Blockly.JavaScript.ORDER_ATOMIC);

    let text = "{\n";
    text += '   uuid: "' + value_uuid_id + '",\n';
    text += "   title: " + value_title + ",\n";
    text += "   body: " + value_message + ",\n";
    text += "   locked: " + value_lock + ",\n";
    text += "   group: " + value_group + ",\n";
    text += "   colorARGB: " + value_argb + ",\n";
    text += "   id: " + value_message_id + ",\n";
    text += "\n}";

    let logText;
    if (logLevel) {
        logText = "console." + logLevel + '("hiobs: " + ' + text + ");\n";
    } else {
        logText = "";
    }

    return (
        `sendTo('hiobs${dropdown_instance}', 'send', {\n` +
        `  uuid: "${value_uuid_id}",\n` +
        `  title: ${value_title},\n` +
        `  body: ${value_message},\n` +
        `  locked: ${value_lock},\n` +
        `  group: ${value_group},\n` +
        `  colorARGB: ${value_argb},\n` +
        `  id: ${value_message_id},\n` +
        `});\n${logText}`
    );
};
