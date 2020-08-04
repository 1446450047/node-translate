import * as querystring from "querystring";
import * as https from "https";
import md5 = require("md5");
import {appId, appSecret} from "./private.db";

export const translate = (word:string) => {
    let from, to;
    if (/[A-Za-z]/.test(word)) {
        from = "en";
        to = "zh";
    }else {
        from = "zh";
        to = "en";
    }
    const salt = 1435660288;
    const sign = md5(appId + word + salt + appSecret);
    const query: string = querystring.stringify({
        q: word,
        from,
        to,
        appid: appId,
        salt: salt,
        sign: sign
    });
    const options = {
        hostname: "api.fanyi.baidu.com",
        port: 443,
        path: `/api/trans/vip/translate?` + query,
        method: "GET",
    };
    const chunks :Buffer[]= [];
    type BaiduResult = {
        error_code?: string
        error_msg?: string
        from: string
        to: string
        trans_result: { src: string, dst: string }[]
    }

    const request = https.request(options, (response) => {
        response.on("data", (chunk) => {
            chunks.push(chunk);
        });
        response.on("end", () => {
            const string = Buffer.concat(chunks).toString();
            const obj: BaiduResult = JSON.parse(string);
            if (obj.error_code) {
                console.error(obj.error_msg);
            } else {
                const result = obj.trans_result[0].dst;
                console.log(result);
            }
        });
    });


    request.on("error", (e) => {
        console.error(e);
    });
    request.end();
};
