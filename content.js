// Use a flag on the window object to ensure the listener is only added once per page load.
// This prevents multiple listeners from being created if the user clicks the extension button multiple times.
if (!window.g2bExtractorListenerAdded) {
    window.g2bExtractorListenerAdded = true;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "startExtraction") {
            extractDataFromCurrentPage().then(text => {
                if (text) {
                    // Request background.js to process the extracted text
                    chrome.runtime.sendMessage({
                        action: "processData",
                        data: text,
                        term: document.title
                    }, (response) => {
                        sendResponse(response);
                    });
                } else {
                    sendResponse({ status: 'error', message: 'Could not find element to extract data.' });
                }
            }).catch(error => {
                sendResponse({ status: 'error', message: error.message });
            });
            return true; // Return true for asynchronous response
        }
    });
}

// Function to try multiple selectors and return the first found element
async function findFirstAvailableElement(selectors) {
    for (const selector of selectors) {
        try {
            // Wait for each selector for 3 seconds
            const element = await waitForElement(selector, 3000);
            return element; // If successful, return the element immediately
        } catch (error) {
            console.log(`'${selector}' element not found. Trying next selector.`);
        }
    }
    // If all selectors fail, throw an error
    throw new Error('Could not find element with any specified selector.');
}


// Helper function to wait for a specific element to appear
function waitForElement(selector, timeout = 7000) {
    return new Promise((resolve, reject) => {
        const intervalTime = 100;
        let elapsedTime = 0;

        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                resolve(element);
            }

            elapsedTime += intervalTime;
            if (elapsedTime >= timeout) {
                clearInterval(interval);
                reject(new Error(`Could not find element: ${selector}`));
            }
        }, intervalTime);
    });
}

// Function to extract data from the current page (improved)
async function extractDataFromCurrentPage() {
    try {
        const selectorsToTry = [
            '.addChoice_input', // Original selector
            '#mf_wfm_container_addChoice_input_0' // ID selector from Python code
        ];
        const textElement = await findFirstAvailableElement(selectorsToTry);
        let resultText = textElement.innerText;

        // Also try to extract addChoicePart data if it exists
        try {
            const partSelectorsToTry = [
                '.addChoicePart_input',
                '#mf_wfm_container_addChoicePart_input_0'
            ];
            const partElement = await findFirstAvailableElement(partSelectorsToTry);
            if (partElement && partElement.innerText.trim()) {
                resultText += '\n' + partElement.innerText;
            }
        } catch (e) {
            // addChoicePart element not found, skip silently
            console.log('addChoicePart element not found, skipping.');
        }

        return resultText;
    } catch (error) {
        console.error('Extraction Error:', error);
        throw error;
    }
}
