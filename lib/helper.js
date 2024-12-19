module.exports = {
    /**
     * @param {string} id
     */
    async createEnum(id) {
        let common = {};
        common = {
            name: this.helper_translator("enum_name"),
            enabled: true,
            color: "rgba(116,94,220,1)",
            desc: this.helper_translator("enum_desc"),
            members: [],
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASoAAAIACAMAAAACO9HQAAAArlBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABeyFOlAAAAOXRSTlMAi+VQByCPEZdwhbn4p2TQ/NTEUwsEQKJZ7vXcsqxHHPJ6F5w7LCji2Mok6X5DMXVfTb7BbZNoNrsJbOT3AAATlklEQVR42uzZbXOaQBQF4BNFUUJ1TSAqimI0RvGlJtqk5///sU6bTOWyoEmb7Uwhz0fHD8zlcvfsLt7Om7WcL1eLVeTyv+dGq8XVF6c18/DRbnfTjmIBqc50d4sPc+e0WWjt9RwfwD4UvE4v2gcbf2feCFgSQWOOP3cXslTCO/yZcbeQg/wU1R3j/ax1aT69pGBt4Z1mHZZUZ4b38J3SfXtHyvHxZrUlS21ZwxuN+iy51Qhv8qSYq7Lv1teT5n9vsq539xXmUk94gwtmC4ZfZzYKxd5MLl1mu8BZDWaJpiMLheRdhwGzNHDGlBnaLQ8FZjcHzDDFSd+oW45QdP51h7pvOGFCzaCKUthVqJkgV49p7rqgI0rn1RXTesixDZjS2aJEZgOmBFtksrV/Tgs9zXVeyJSBjSwhJXVA6UwUpRAZWpSCB5TQtUupBc04ohDcoJQ2AYVojLThZ6Ve3AQUhkh5oOAWP3bm2rgUHiBYAwo7lFiPwsBCUpPCBUrNodBEgidT/d5HuV0yqeLlNlV/DJPG29jCKfbdnY1TrHg7hkm3q7y28u//2aAahRFJtTx4yBbXByQ5qMfI5h2WimQUjmBOlUn3fs4cu4Qxtf2xq6vIYF0ovlIXFjJUK8c5UYMxYc62+YoJ7hymPPfPHHHYezEyvTPHRP1nmDIOmHCFV3PtQMuMuE/hCSn+I4XvPlKeKPRjmOIwaZ71a3ALU5YU9P79ypSvkOYupSVMscV7dfBi8G+aqse0EIIdMSWy9Qki9WCKI2IoftkyQdVgyp5pSnbwgZqDXMMV0/Yw5VZ08BY/reXm0BRbUbM7tWPXH2dHjbJhyhcmrPX1rwpTZtTVkXRPzT2S6tTNYMpGWwM9xaO+BVMeqOsiyaXGRVKXugeY4q94pLx08bowZnT2VjKiJjp7nzuCMQ0mbNKh7hrGzKlbI6lDTRtJa+rmMKaaDswhE2yY06dmo79FqaFPD6kPc2yVCjYLHnVgkF6Jii8rca6WfiWjlga1ebQAfCVmh0Gxey6ML5myPBfn3RjGyNmofNTkwYxJDqW2BenZpeBuIVltSg4Mkpm4Jrt+BJN8mTFXMdJa5+7g4pVMqD5MGslZ0JPLiVFWl0edGLpdwN+CHXRxh0ddC0bNmdCTTWbDsOqCLyLHQ5Z4yFfDGFk8J+KLRRWG2XI7OhHZ2LwbZ7i/bPQ85Kk1u4+P3WYNebxe43I/dG5gniuClSNCyqfcKOiIUlXw6Qc7dmzDIBAAMDCgKEOkSp8J2H8xSngkkCnoziNc6aH/QDWhOm9etiZUqFBdhiqHKocqhyqHKocqhyqHKocqhyqH6n7PU/0+GvoeqHQeKlT7UOVQ5VDlUOVQ5VDlUOVQ5VDlHqaa3xoyYfyqF6ocqhyqHKocqhyqHKocqhyqHKocqhyqHKocqhyqHKocqhyqHKocqpW9e81NGwrCMDwQB1ow5WI7+AIYXC4OAREKlHz731h3MJ4zOqhImWcB58cry/KPM2Ox50lVXed1loec5e7SWpOT7apfLEPWsuivtuRk3brs+FPzrJ5fq4ek2g5GkKlTEnu7QOjyRmJpDZnRYOs9VXIIISXfAxtP4WAai3fayoWHxG+qeAYn2ZoEyjGcjEsSWGdwMot9pgq+4Ci/U6OqgKOiokb3HI6+Ao+pfsBZu6IGyQTOJklj/zac/fCXagGFOTVYQWFFDeZQWHhLNYbGG7GqHAp5Raw1NMa+Up2hMiPWASoHYs2gcvaUagCVUUWcAioFcaoRVAaeUmXQSYmxh9KeGCl0Mj+pXqHUIkYEpYgYLSjtvaQ6QmlOjBOUTsQYQOnoJdULlPrE6EGpR4w+lF4slVRkqSyVpbJUlspSWSpLZakslaWyVJbKUlkqS2WpLJWlslSWylJZKktlqSyVpbJUlspSWSpLZameOdXLt7tfNf+/96v2UOoQI4VS+sS39pIldD6JsYXSlhif0FkmXlLRDCqjkjg7qOyIU46gMiM/qSKo/CFWCyotYn1BJfKUKimgsSBWGUIhLIm1gEaRKFL5e6y+qEFP+6ng/7GK/E1uDeAse6UG8RDOhjE1eM00sxD+UsXvcBQuqNH+A44+9tRoEcLRe+wxFXUncJKfSWCzg5PdhgTOuWOprt/Z5eAGB+MNiVR9OOhXJLIZw8Et8D4Rv75A6OMUKGbXPc7ZB6cPCF3WD9mzsOlNMjQI62kUkIvjbZijQT68HclFEE3rEA2ySW/zwO0dQZcVk0r8P04NbNHJMyw6+X4slaUiSyVmqcQslZilErNUYpZKzFKJWSoxSyVmqcQslZilErNUYpZKzFKJWSoxSyVmqcQslZilErNUYpZKzFKJPVGqMu39HrCmt+s9ITfbX51pw6mdX1tyk9yvt4ZTf/fS8jGpknQCkXavIrH4Zw2R+mdMYlWvDZFJmvhPdR9CLD+RUNSGWDsioVMOseHdd6q/IVz0uySQ3ODklpBAtw8X4V+/qU5w9C5pNYCjgaTUOxydfKZK4exPQk1aulkIXvIFZ6m/VOXyET+8WEDh+IifcyxfvaWaQyEviZXUUKgTYpU5FOa+Um2g0iHWp3ZyjtWBysZTqg5UsoA4F6hciBNkUOl4SlVA50iM7ggqoy4xjtAp/KSqoLTSvtT1s3MrKFVeUq2hNCXGFUpXYkyhtPaS6gylGTEOUDoQYwals+1ZsJUUluofe3falTYQhXH8okBQFoMkQNhlkU1ZatU+3/+LtdWJgk0mkxjIpLm/lz2n9pz/IcmlTmY4FafiVJyKU3EqTsWpOBWn4lScilNxKk7FqTgVp+JUnIpTcSpOxak4FafiVJyKU3EqTvVfpLqMJdUAEfVPsmjs7iTHaAxiSbVBRBOSqCGiGkmUENEmllSWiWiuSGKKiKYkcYVoTCuWVLRENBuSyHcQSSdPEhtEs6R4Um0RyYKkqoikSlILRLKNKZUxivX6E6aRr7/4r8COETpVnA/2uUVy5VgHEMGaRxtA4kplLRDengKsRghttKIAe4S3sGJLRTMn1klRaJgIyWyQEOds68wovlTUHCGcEimomSFL1UhBCeGMmhRnKpp1EYK5JSV7ByE4e1KyNRFCd0bxpiIrV4Gq2w0pGlZN5fzVISna3EJVJWedYJ+F4UMdCpxWk0KYFedQMC/OKIRmy4GC+sPwVLt3jJvtmtRuf29TWIVBwE9tDwoUln2/3wX81OaYNzrRYKOTzOFUnIo4lTJOpYxTKeNUyjiVMk6ljFMp41TKOJUyTqWMUynjVMo4lbKspprVcq1+f3LdLpC6DKbaPF/gw+JBuVbmUr3+wjGzpRgrY6mMEv5VebBJQbZSbbrwdDukYJlKNRjBx3xGgbKUalCBr3Vwqwylmo0gMR9TgOyksrqQerJJLjupJvhk/rp6nG3214sw221nJtUUn/orEgY3+NBZkVRmUt3CVdnRp/yz8gLjrKR6/Cw18Nua1rwnmayk6vm/HDJRXTmZjVRjE0JPssbasUgiI6leZBdZG64GSWQkVQ9CX/pGyIRkMpHKHkEYSF/0mZNMJlLNIDg2eSjANSZ/2UjVDtjRvqt04kEmUj0EbNNfVXkjLBupJhAaASlzJJGJVD0IrwFHBLVIIhOpbiEUAt5e65FEJlItA55wj0pvT2Yi1Q0Egzw1IfwgCU7FqTgVpzrGqZRxKmWcShmnUsaplHEqZZxKGadSxqmUcSplnEoZp1LGqZRxKmWcShmnUpZYqnmr+maybebpK04lUn3V6V/adIRTiVQeug06xKlEKk99gz5xKlkq1If0gVNJU6FukYtTyVOhTy5OFZAKDRI4VVCqhU3vONVhqt7j4M3dwuNjxakOU7VIsO/Mf/Zh51RfUwk1uCrib3Eqn1TUhys3Kb/plWozTuWR6h5eLnIrTvU1FT3BkzkZc6ovqbbw4VxyquNUU/gxf3Kqo1QW/LU5FR1aw1fnnlMdqsPfLac69ASJPac6UIbwMniz65n48MSpDvQgTEl4nePDKpWprNXm3jhHKhpewHWXulT2vjXHX075bnaiC/DV64iyH2lL1e7iQP3KOsVtfeb1wlzHTlUqo4wvnDsrfKqp9+4BS6/b0g4uE29Gy1Lb0D7VeIF/zfehUw297z91r9cIDRP/qvQGeqeybuBpYimnOr4rVQp0aA7BUjjSdPmqc6oJfNwUQqYadgHA3NERB+9MpaOqzWt9U73C13oaLhUZD8tF9ZWOmXjnKB492cvrmqoHf5WdJJUiA0JX9aDcnq1nqoL5GWb562aEY0X7u6mG3odM7+CvqGeqLVytvwXs5qSDQ2Xjm6lmEH7RoQYkHrVM9QNCjwSjaOLA4v57qabeyxYuIdHN65hq5HFe/KaOA6P9t1I9Qmh5p2pZfxmPpQ4+vWiYquB507WqOGDefSfVHkLJ+wJ8JmFYxoeuhqmmPntU3pk4ULWip2p436x3/+61Y7fwYaBfqku/s733IxxYDiOnah83cb14/MP2Eq6WfqnaELbyI68vpt++V22P5yqvP743IazTlIqMp+NpNGIqy/Hc9fHB8w7egmujXaqGZKczu4RDuXqkVLTz3P+rCKHt/S3rp3apHqU7VL5U4MWgUBpdwNn6fUnfe+/X19Iu1Ur+G7nmWpJK3XBl0xd9CE069AzhRrtUdgXvKnnyUqhLU0VXhrDxvneOtEtFy4DvXVbvNKmW3rvRreAaa5fqGcIz+bg+SSqfZ4RdgbDRLtUlhLVNPtqdE6SaQ7B9dkIeaJfK6gSvlt7M40+1xruK3/90tLVLRX2F5QPjp9hTjXxu31UINf1SteGaki/7Oe5UHbxz6FgJwk/9UuXXSovwa5V4U3Xxrk7HchC2+qWinPxj5bF8xYjxyZvze94+aJhqWIGwJBmjG2eq8Xv5ruG3Z/S1hqmoBFdNdX1VDIY9E2Z/TF/caZ2qUIHgjONNJWd4rebaap2KnuGqni+VkK5PFRkOXG1OJXcFl1PgVFL5Olw/zp0qVU/AP15NuK6STXWteyoqwlWZcSopqw7XTT5gedGITiinfSraVODKBXyxntCxbN2r/niBy2yS7EyfhUEntIWQ0zcV9eCa+8Swr+qVedGgU7qC8KxxqvEarhYl5ieEksapaI8PbUrKC4SJzqloApczpITsIFS1TmV1j4b2RLQh9LVOdTy0J6MBoad3Kno4GtqTcAmhrHkqe3k0tCdgD+GH5qlo1YErR0kYQLjVPdXx0J6AJoSl9qnkQ/vpTSHc6J/qYGiv0vm9Qqjrn4ouEx3aNxC6KUiV7NA+gzBPQ6pEh/Zpmi5AommCQ/tleoaFN9fJDe0/U/IdUIOhvQihmI5UCQ7tZY2Xomk2tK/1XTar2dBegGuYmlQJDe07CGv93obQbGhvQeilKFUiQ7u9hrBNU6okhvamxq9Oaja0TyBc6PdCrl5Du+VAKKUs1dmH9hpcjylLRfdnHtrrEC7stKU689C+h+taw907gpTPObQ/QTALKUx1zqG9CVdPy02ZNBrab+FqpjLV+Yb2PVy3eu6Kps3Qbtfh2qc01e/27mQ5bSCKwvBJjAPIBoQiYoYQ5lGAcQUTn/d/sWzAagmoXAx0MH2/JSyo+jXQaoHa1qB9xa3JtT7B8UoG7cb/fOafN5WVQXuOW29X+wjV6xi0L3xu+IvPnMoctM9xEQG3ejhPqtrd/zHi1ujuEjy+W98do5ZKpQ7TVJrKpKnENJWYphLTVGKaSkxTiWkqMU0lpqksEKWK7lVCdG2TMNfr6uarrpem0lTQVGKaSkxTiWkqMU0lpqnENJWYphLTVGKaSkxTiWkqMU0lpqnENJWYphLTVGKaSkxTiWkqMU0lpqnENJWYphLTVGKaSkxTid1kqsW3t+Cj3nIvOOTmUoVPPE3QggXpVB5jEayoPPBUoy5siBjzEqlqsGLF0zVhQy2RqsOYDytGPIMpLPAZ6yQ3cRYWTHkORVxeloYVqjQMYEGf5/CMyxvQUMWchhdYMOA5LHF5dzTMcW97U6ES8QzucXmd5AdWfMaeYEOHp/sJCwqM+RVgzNgYNmQCnipqwYJGKk2Thi5syP7kacpDWNCioZk+HKqw40cvKH9UqbmswIYiDR0Ac5LXsMrh9WnSMAcQ+oy1M1AbYZ0xPwSAgIbvUBtLGoLNUnSGB6iNgIbZZsUggz+F2s3Cxe7wgTmoePyZXnfKo+GxBQVg6NPgbV+lqQeV3qk43HsC8xdQ6NMUYKuael1VSjRV4zdGNK3hvA5Nowre5WmqD+G4xSNNecTCrzSVQjgtHNP0NZEjT+pV87smE/IwZRpM6MBhHhMaGSS8MGkJZ62Z9IKUn0zwq3DU0v/XLH6rnWpVhJPSpdqtvdOjer7Csy+5i91kSs+5KdFKTvYzkmyDKZN7OKX1mymNLPZa1JnSduqL8HuNKfUFDqhyx4MzO1a3wB3Vo26RP3pZOCB8bnNHR7KEs6k2u/lYYf4rd30TrlZkar/e9HTf9EuNMfl08Cv3KncGuEnTfMC9XsUXi7tGT+v+TR2K4Z9ir8EDPAisfR4WTR4Kvdyn1ys8TCIe5q8h8qtGx0W/IHQ/odOOuUqpeD6d5XsVHKNfpqPKfRwpM6vTQfVZBsdrPTl3FPpPLXzMoEmnNAf4uGHOmcOwnhviNNlViQ4orbI4g4F347VKsyHOprvslW/yJO+Xe8suzi3sF71CMI7aj/z0HtvROCh4xX4Isb+QsjLCNCisMAAAAABJRU5ErkJggg==",
        };
        await this.createForeignDataPoint(id, common, "enum");
    },
    /**
     * @param {string} id
     * @param {object} content
     */
    async createTemplates(id, content) {
        let common = {};
        common = {
            name: content.name.toString(),
            desc: this.helper_translator("create_adapter"),
        };
        await this.createDataPoint(`settings.${id}`, common, "channel");
        common = {
            name: this.helper_translator("devices"),
            desc: this.helper_translator("create_adapter"),
            type: "string",
            role: "json",
            def: "{}",
            read: true,
            write: false,
        };
        await this.createDataPoint(`settings.${id}.devices`, common, "state");
        common = {
            name: this.helper_translator("widgets"),
            desc: this.helper_translator("create_adapter"),
            type: "string",
            role: "json",
            def: "{}",
            read: true,
            write: false,
        };
        await this.createDataPoint(`settings.${id}.widgets`, common, "state");
        common = {
            name: this.helper_translator("screens"),
            desc: this.helper_translator("create_adapter"),
            type: "string",
            role: "json",
            def: "{}",
            read: true,
            write: false,
        };
        await this.createDataPoint(`settings.${id}.screens`, common, "state");
    },
    /**
     * @param {string} id
     */
    subScribe(id) {
        this.subscribeStates(`${id}.connected`);
        this.subscribeStates(`${id}.date`);
        this.subscribeStates(`${id}.approved`);
        this.subscribeStates(`${id}.noPwdAllowed`);
        this.subscribeStates(`${id}.sendNotification`);
        this.subscribeStates(`${id}.sendNotification_open_del`);
    },
    /**
     * @param {string} id
     * @param {object|null} content
     */
    async createDevice(id, content) {
        let common = {};
        common = {
            name: id,
            desc: id,
            statusStates: {
                onlineId: `${this.namespace}.${id}.connected`,
            },
        };
        await this.createDataPoint(id, common, "device");
        common = {
            name: this.helper_translator("connect"),
            desc: this.helper_translator("create_adapter"),
            type: "boolean",
            role: "indicator.reachable",
            def: false,
            read: true,
            write: false,
        };
        await this.createDataPoint(`${id}.connected`, common, "state");
        this.subscribeStates(`${id}.connected`);
        common = {
            name: this.helper_translator("name"),
            desc: this.helper_translator("create_adapter"),
            type: "string",
            role: "info.name",
            def: "",
            read: true,
            write: false,
        };
        await this.createDataPoint(`${id}.name`, common, "state");
        if (content != null) {
            common = {
                name: this.helper_translator("ID"),
                desc: this.helper_translator("create_adapter"),
                type: "string",
                role: "info.name",
                def: content["deviceID"].toString(),
                read: true,
                write: false,
            };
            await this.createDataPoint(`${id}.id`, common, "state");
        }
        common = {
            name: this.helper_translator("key"),
            desc: this.helper_translator("create_adapter"),
            type: "string",
            role: "text",
            def: null,
            read: false,
            write: false,
        };
        await this.createDataPoint(`${id}.key`, common, "state");
        common = {
            name: this.helper_translator("date"),
            desc: this.helper_translator("create_adapter"),
            type: "number",
            role: "value.time",
            def: Date.now(),
            read: true,
            write: false,
        };
        await this.createDataPoint(`${id}.date`, common, "state");
        this.subscribeStates(`${id}.date`);
        common = {
            name: this.helper_translator("iob_id"),
            desc: this.helper_translator("create_adapter"),
            type: "string",
            role: "info.name",
            def: id,
            read: true,
            write: false,
        };
        await this.createDataPoint(`${id}.iobID`, common, "state");
        common = {
            name: this.helper_translator("approved"),
            desc: this.helper_translator("create_adapter"),
            type: "boolean",
            role: "switch",
            def: false,
            read: true,
            write: true,
        };
        await this.createDataPoint(`${id}.approved`, common, "state");
        this.subscribeStates(`${id}.approved`);
        common = {
            name: this.helper_translator("login_pw"),
            desc: this.helper_translator("create_adapter"),
            type: "boolean",
            role: "switch",
            def: false,
            read: true,
            write: true,
        };
        await this.createDataPoint(`${id}.noPwdAllowed`, common, "state");
        this.subscribeStates(`${id}.noPwdAllowed`);
        if (content != null) {
            this.setNewStates(id, content);
        }
        common = {
            name: this.helper_translator("app_version"),
            desc: this.helper_translator("create_adapter"),
            type: "string",
            role: "info.firmware",
            def: "",
            read: true,
            write: false,
        };
        await this.createDataPoint(`${id}.app_version`, common, "state");
        common = {
            name: this.helper_translator("notify"),
            desc: this.helper_translator("create_adapter"),
            type: "mixed",
            role: "value",
            def: "",
            read: true,
            write: true,
        };
        await this.createDataPoint(`${id}.sendNotification`, common, "state");
        common = {
            name: this.helper_translator("opennotify"),
            desc: this.helper_translator("create_adapter"),
            type: "string",
            role: "json",
            def: "[]",
            read: true,
            write: false,
        };
        await this.createDataPoint(`${id}.sendNotification_open`, common, "state");
        common = {
            name: this.helper_translator("delopennotify"),
            desc: this.helper_translator("create_adapter"),
            type: "boolean",
            role: "button",
            def: false,
            read: true,
            write: true,
        };
        await this.createDataPoint(`${id}.sendNotification_open_del`, common, "state");
        this.subscribeStates(`${id}.sendNotification_open_del`);
        this.subscribeStates(`${id}.sendNotification`);
        this.setState(`${id}.sendNotification`, "", true);
        common = {
            name: this.helper_translator("aes"),
            desc: this.helper_translator("create_adapter"),
            type: "string",
            role: "state",
            def: "",
            read: true,
            write: false,
        };
        await this.createDataPoint(`${id}.aesKey`, common, "state");
        const get_aes = await this.getStateAsync(`${id}.aesKey`);
        const random_key = this.makekey(6, true);
        if (!get_aes || get_aes.val == null || get_aes.val == "") {
            const shaAes = this.encrypt(random_key.toString());
            await this.setStateAsync(`${id}.aesKey`, shaAes, true);
        } else {
            this.log_translator("info", "found_aes");
        }
        common = {
            name: this.helper_translator("aes_new"),
            desc: this.helper_translator("create_adapter"),
            type: "boolean",
            role: "button",
            def: false,
            read: true,
            write: true,
        };
        await this.createDataPoint(`${id}.aesKey_new`, common, "state");
        common = {
            name: this.helper_translator("aes_active"),
            desc: this.helper_translator("create_adapter"),
            type: "boolean",
            role: "switch",
            def: false,
            read: true,
            write: true,
        };
        await this.createDataPoint(`${id}.aes_active`, common, "state");
        common = {
            name: this.helper_translator("decrypt_AES"),
            desc: this.helper_translator("create_adapter"),
            type: "boolean",
            role: "button",
            def: false,
            read: true,
            write: true,
        };
        await this.createDataPoint(`${id}.aesKey_view`, common, "state");
        await this.subscribeStatesAsync(`${id}.aesKey_view`);
        await this.subscribeStatesAsync(`${id}.aesKey_new`);
        await this.subscribeStatesAsync(`${id}.aesKey_active`);
    },
    /**
     * @param {string} id
     * @param {object} content
     */
    async setNewStates(id, content) {
        this.setState(`${id}.iobID`, id, true);
        this.setState(`${id}.date`, Date.now(), true);
        content["deviceID"] =
            content["deviceID"] != null && content["deviceID"] != "" ? content["deviceID"].toString() : "";
        this.setState(`${id}.id`, content["deviceID"], true);
        content["deviceName"] =
            content["deviceName"] != null && content["deviceName"] != "" ? content["deviceName"].toString() : "";
        this.setState(`${id}.name`, content["deviceName"], true);
        this.setState(`${id}.connected`, false, true);
    },
    /**
     * Read devices
     */
    async loadKnownDevices() {
        const devices = await this.getDevicesAsync();
        for (const element of devices) {
            const id = element["_id"].split(".").pop();
            if (id != null) {
                await this.createDevice(id.toString(), null);
            }
            this.log_translator("info", "found_device", id);
            const approved = await this.getStateAsync(`${id}.approved`);
            const connected = await this.getStateAsync(`${id}.connected`);
            const key = await this.getStateAsync(`${id}.key`);
            const name = await this.getStateAsync(`${id}.name`);
            const userid = await this.getStateAsync(`${id}.id`);
            const noPwdAllowed = await this.getStateAsync(`${id}.noPwdAllowed`);
            const aesKey = await this.getStateAsync(`${id}.aesKey`);
            const aesKey_active = await this.getStateAsync(`${id}.aes_active`);
            const open = await this.getStateAsync(`${id}.sendNotification_open`);
            let open_notify = [];
            try {
                open_notify = JSON.parse(open.val);
            } catch {
                open_notify = [];
                this.adapter.log.warn(`Cannot parse notification`);
            }
            const iobID = await this.getStateAsync(`${id}.iobID`);
            this.subscribeStates(`${id}.noPwdAllowed`);
            this.subscribeStates(`${id}.approved`);
            this.subscribeStates(`${id}.sendNotification_open_del`);
            this.subscribeStates(`${id}.aesKey_view`);
            if (aesKey && aesKey.val && aesKey.val.indexOf("aes-192")) {
                aesKey.val = this.decrypt(aesKey.val.toString());
            }
            if (approved && connected && key && name && noPwdAllowed && iobID && userid) {
                const dec = key.val != null && key.val != "" ? this.decrypt(key.val) : null;
                const dev = {
                    iob_id: iobID.val,
                    device: userid.val,
                    approved: approved.val,
                    connected: connected.val,
                    key: dec,
                    name: name.val,
                    aesKey: aesKey.val,
                    aesKey_active: aesKey_active.val,
                    open_notify: open_notify,
                    noPwdAllowed: noPwdAllowed.val,
                    socket: {},
                    req: {},
                    ip: "",
                };
                this.devices.push(dev);
            }
        }
        let common = {};
        common = {
            name: this.helper_translator("settings"),
            desc: this.helper_translator("create_adapter"),
        };
        await this.createDataPoint("settings", common, "channel");
    },
    /**
     * @param {string} ident
     * @param {object} common
     * @param {string} types
     * @param {object|null|undefined} [native=null]
     */
    async createDataPoint(ident, common, types, native) {
        try {
            const nativvalue = !native ? { native: {} } : { native: native };
            const obj = await this.getObjectAsync(ident);
            if (!obj) {
                await this.setObjectNotExistsAsync(ident, {
                    type: types,
                    common: common,
                    ...nativvalue,
                }).catch(error => {
                    this.log_translator("error", "catch", `createDataPoint: ${error}`);
                });
            } else {
                let ischange = false;
                if (JSON.stringify(obj.common) != JSON.stringify(common)) {
                    ischange = true;
                } else if (JSON.stringify(obj.type) != JSON.stringify(types)) {
                    ischange = true;
                }
                if (native) {
                    if (JSON.stringify(obj.native) != JSON.stringify(nativvalue.native)) {
                        ischange = true;
                        delete obj["native"];
                        obj["native"] = native;
                    }
                }
                if (ischange) {
                    this.log_translator("debug", "Change common", `${this.namespace}.${ident}`);
                    delete obj["common"];
                    obj["common"] = common;
                    obj["type"] = types;
                    await this.setObjectAsync(ident, obj);
                }
            }
        } catch (e) {
            this.log_translator("error", "try", `createDataPoint: ${e}`);
        }
    },
    /**
     * @param {string} ident
     * @param {object} common
     * @param {string} types
     * @param {object|null|undefined} [native=null]
     */
    async createForeignDataPoint(ident, common, types, native) {
        try {
            const nativvalue = !native ? { native: {} } : { native: native };
            const obj = await this.getForeignObjectAsync(ident);
            if (!obj) {
                await this.setForeignObjectNotExistsAsync(ident, {
                    type: types,
                    common: common,
                    ...nativvalue,
                }).catch(error => {
                    this.log_translator("error", "catch", `createDataPoint: ${error}`);
                });
            } else {
                let ischange = false;
                if (JSON.stringify(obj.common) != JSON.stringify(common)) {
                    ischange = true;
                } else if (JSON.stringify(obj.type) != JSON.stringify(types)) {
                    ischange = true;
                }
                if (native) {
                    if (JSON.stringify(obj.native) != JSON.stringify(nativvalue.native)) {
                        ischange = true;
                        delete obj["native"];
                        obj["native"] = native;
                    }
                }
                if (ischange) {
                    this.log_translator("debug", "Change common", `${this.namespace}.${ident}`);
                    delete obj["common"];
                    obj["common"] = common;
                    obj["type"] = types;
                    await this.setForeignObjectAsync(ident, obj);
                }
            }
        } catch (e) {
            this.log_translator("error", "try", `createDataPoint: ${e}`);
        }
    },
};
