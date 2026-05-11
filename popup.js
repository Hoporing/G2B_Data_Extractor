document.getElementById('extractBtn').addEventListener('click', () => {
    const status = document.getElementById('status');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;

        if (!tabs[0].url || !tabs[0].url.startsWith('https://shop.g2b.go.kr')) {
            status.textContent = 'Error: Please run on G2B site.';
            return;
        }

        status.textContent = 'Injecting script';

        // 1. Programmatically inject content.js into the current tab.
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }, () => {
            if (chrome.runtime.lastError) {
                status.textContent = `Injection Error: ${chrome.runtime.lastError.message}`;
                return;
            }

            status.textContent = 'Extracting data';

            // 2. After successful injection, send the message.
            chrome.tabs.sendMessage(tabId, {
                action: "startExtraction"
            }, (response) => {
                if (chrome.runtime.lastError) {
                    status.textContent = 'Error: Please refresh the page and try again.';
                    console.error(chrome.runtime.lastError.message);
                } else if (response && response.status === 'completed') {
                    status.innerHTML = 'Extraction complete<br>Starting download';
                } else if (response && response.status === 'error') {
                    status.textContent = `Error: ${response.message}`;
                }
            });
        });
    });
});
