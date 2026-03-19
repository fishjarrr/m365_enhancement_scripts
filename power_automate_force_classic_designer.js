// ==UserScript==
// @name         Power Automate Force Classic Designer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically replaces 'v3=true' with 'v3=false' in Power Automate URLs to force the Classic Designer.
// @description:zh-CN 强制 Power Automate 使用经典设计器。自动检测 URL 中的 v3=true 并替换为 v3=false。
// @author       fishjarrr (powered by Gemini)
// @match        https://make.powerautomate.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const logPrefix = '%c[PA Classic Force]:';
    const logStyle = 'color: #d13438; font-weight: bold;'; // Power Automate Red
    let lastUrl = window.location.href;

    console.log(logPrefix, logStyle, 'Script initialized.');

    // 核心检查函数
    function checkAndEnforceClassic() {
        const url = new URL(window.location.href);
        const v3Param = url.searchParams.get('v3');

        // 情况1: 明确标记为 v3=true -> 必须杀掉
        if (v3Param === 'true') {
            console.log(logPrefix, logStyle, 'Detected v3=true (New Designer). Switching to Classic...');
            url.searchParams.set('v3', 'false');
            // 使用 replace 而不是 assign，防止用户点击“后退”时陷入重定向死循环
            window.location.replace(url.toString());
        }

        // 情况2 (可选): 如果你想更激进，连没有参数的情况也强制加上 v3=false
        // 目前很多租户默认就是新版，所以这一步是推荐的
        // if (url.pathname.includes('/flows/') && !v3Param) {
        //     console.log(logPrefix, logStyle, 'No version param found. Forcing v3=false...');
        //     url.searchParams.set('v3', 'false');
        //     window.location.replace(url.toString());
        // }
    }

    // 1. 脚本启动时立即检查一次
    checkAndEnforceClassic();

    // 2. 针对 SPA (单页应用) 的持续监听
    // Power Automate 内部跳转不会刷新页面，所以需要轮询 URL 变化
    setInterval(() => {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            checkAndEnforceClassic();
        }
    }, 500); // 0.5秒检查一次，反应够快且不耗性能

})();