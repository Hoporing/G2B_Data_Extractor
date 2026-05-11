// Import SheetJS library.
importScripts('xlsx.full.min.js');

// Listener to receive messages from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "processData") {
        try {
            const items = parseTextData(request.data);
            if (items.length > 0) {
                generateExcel(items, request.term);
                sendResponse({ status: 'completed' });
            } else {
                sendResponse({ status: 'error', message: 'No data extracted.' });
            }
        } catch (e) {
            console.error('Error processing data:', e);
            sendResponse({ status: 'error', message: e.message });
        }
        return true; // Return true for asynchronous response
    }
});

function parseTextData(text) {
    const items = [];
    if (!text) return items;

    const lines = text.split('\n');
    lines.forEach(line => {
        if (!line.trim()) return;

        const parts = line.split(']');
        if (parts.length < 3) return;

        const category = parts[0].lstrip('[');
        const code = parts[1].lstrip(' [');
        const detail = parts[2];
        const details = detail.split(':');
        const price = details[1];
        const info = details[0].split(',');

        let product_name, manufacturer, model, option;
        if (info.length > 3) {
            [product_name, manufacturer, model, option] = info;
        } else if (info.length > 2) {
            [product_name, manufacturer, model] = info;
            option = "";
        } else {
            [product_name, model] = info;
            manufacturer = "";
            option = "";
        }

        items.push({
            'Category': category,
            'Product Code': code,
            'Item': product_name,
            'Manufacturer': manufacturer,
            'Model': model,
            'Option': option,
            'Price': price
        });
    });
    return items;
}

function generateExcel(data, searchTerm) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");

    // Save to file (using memory buffer)
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create Blob object
    const blob = new Blob([wbout], { type: 'application/octet-stream' });

    // Use FileReader to convert Blob to a data URL.
    const reader = new FileReader();
    reader.onload = () => {
        const dataUrl = reader.result;
        chrome.downloads.download({
            url: dataUrl,
            filename: `${searchTerm.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, '_')}_extracted.xlsx`
        });
    };
    reader.readAsDataURL(blob);
}

// Add lstrip to String prototype (similar to Python's lstrip)
String.prototype.lstrip = function (chars) {
    let regex = new RegExp("^[" + chars + "]+", "g");
    return this.replace(regex, "");
};


