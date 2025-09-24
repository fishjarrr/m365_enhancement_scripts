// ==UserScript==
// @name         SharePoint Enhancement
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Integrates three major functions: 1. Forces "Site Contents" links to open in a new tab. 2. Forces List/Library views into fullscreen mode. 3. Automatically clicks the "Expand content" button to hide the sidebar on page load.
// @description:zh-CN 集成三大功能：1. 强制“网站内容”页的链接在新标签页打开。2. 强制列表/文档库视图使用全屏模式。3. 页面加载后自动点击“展开内容”按钮隐藏侧边栏。
// @author       fishjarrr (powered by Gemini)
// @match        *://*.sharepoint.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // --- 全局设置 ---
    const logPrefix = '%c[SP Enhancement V3.0]:';
    const logStyle = 'color: #0078D4; font-weight: bold;';
    const currentPath = window.location.pathname;

    console.log(logPrefix, logStyle, `Script running on: ${currentPath}`);


    // ===================================================================================
    //
    //   功能一: 强制列表/文档库视图使用全屏模式
    //   说明: 当访问任何列表或文档库时，检查URL是否缺少全屏参数 (env=WebViewList)。
    //         如果缺少，则自动加上并重新加载页面，以强制进入无侧边栏的全屏视图。
    //
    // ===================================================================================
    if (currentPath.includes('/Lists/') || currentPath.includes('/Forms/')) {
        const url = new URL(window.location.href);
        if (url.searchParams.get("env") !== "WebViewList") {
            console.log(logPrefix, logStyle, 'Feature 1: Fullscreen parameter not found. Redirecting...');
            url.searchParams.set("env", "WebViewList");
            // 使用 replace 跳转，不污染浏览器历史记录，且此操作会终止后续脚本执行，重新加载页面
            window.location.replace(url.toString());
            return; // 确保在跳转后不再执行任何其他代码
        } else {
            console.log(logPrefix, logStyle, 'Feature 1: Page is already in fullscreen mode.');
        }
    }


    // ===================================================================================
    //
    //   功能二: 强制“网站内容”页的链接在新标签页中打开
    //   说明: 在“网站内容”(viewlsts.aspx) 页面，监听所有点击事件。
    //         如果点击的是指向列表或库的链接，则阻止默认行为，改为在新标签页中打开。
    //
    // ===================================================================================
    if (currentPath.includes('/_layouts/15/viewlsts.aspx')) {
        console.log(logPrefix, logStyle, 'Feature 2: "Site Contents" page detected. Activating "Open in New Tab".');

        const handleClickInterceptor = (event) => {
            // 从事件目标向上查找最近的 <a> 标签
            const targetLink = event.target.closest('a');

            // 确保链接存在且是我们要处理的类型
            if (targetLink && (targetLink.href.includes('/Lists/') || targetLink.href.includes('/Forms/'))) {
                const url = new URL(targetLink.href, window.location.origin).href;
                console.log(logPrefix, logStyle, `Feature 2: Intercepted click on "${url}". Opening in new tab.`);
                event.preventDefault(); // 阻止默认的页面内跳转
                event.stopPropagation(); // 停止事件冒泡
                window.open(url, '_blank'); // 在新标签页打开
            }
        };

        // 使用 document.addEventListener 可以在页面加载早期就绑定事件
        // 使用 true (捕获阶段) 能确保我们的监听器比页面自身的脚本更早触发
        document.addEventListener('click', handleClickInterceptor, true);
    }


    // ===================================================================================
    //
    //   功能三: 页面加载后自动隐藏侧边栏 (点击“展开内容”按钮)
    //   说明: 适用于大多数现代SharePoint页面。脚本会持续查找“展开内容”按钮，
    //         找到后会自动点击一次，实现隐藏左侧导航栏，为主内容区提供更大空间。
    //
    // ===================================================================================
    // 这个功能应该在非跳转页面上执行，所以放在所有逻辑的最后
    console.log(logPrefix, logStyle, 'Feature 3: Initializing "Auto Hide Sidebar" observer.');

    const buttonTitleToClick = "Expand content";
    const checkInterval = 500; // 每半秒检查一次
    const timeout = 15000; // 15秒后停止查找

    let elapsedTime = 0;

    const intervalId = setInterval(() => {
        const expandButton = document.querySelector(`button[title="${buttonTitleToClick}"]`);

        if (expandButton) {
            console.log(logPrefix, logStyle, 'Feature 3: "Expand content" button found. Clicking now.');
            expandButton.click();
            clearInterval(intervalId); // 任务完成，停止计时器
        } else {
            elapsedTime += checkInterval;
            if (elapsedTime >= timeout) {
                clearInterval(intervalId); // 超时，停止计时器
                console.log(logPrefix, logStyle, 'Feature 3: Timed out. "Expand content" button not found.');
            }
        }
    }, checkInterval);

})();
