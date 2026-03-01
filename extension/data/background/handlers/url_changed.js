import browser from 'webextension-polyfill';

// Notifies tabs when their URL changes.
// This is triggered in the background as there's no native event which is emitted when `history#pushState` modifies the URL.
function handleWebNavigation ({tabId, frameId}) {
    browser.tabs.sendMessage(tabId, {action: 'tb-url-changed'}, {frameId})
        .catch(error => {
            // Receiving end errors are not really relevant to us and happen a lot for iframes and such where toolbox isn't active.
            if (error.message !== 'Could not establish connection. Receiving end does not exist.') {
                console.warn('tb-url-changed: ', error.message, error);
            }
        });
}

const filter = {url: [{hostContains: 'reddit.com'}]};

// Some browsers (Safari) do not support all webNavigation events or the url
// filter parameter. Use optional chaining and fall back without a filter if
// the filtered addListener call throws.
for (const event of [
    browser.webNavigation.onReferenceFragmentUpdated,
    browser.webNavigation.onHistoryStateUpdated,
]) {
    if (!event) {
        continue;
    }
    try {
        event.addListener(handleWebNavigation, filter);
    } catch {
        event.addListener(handleWebNavigation);
    }
}
