
document.getElementById("readBtn").addEventListener("click", () => {


    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

        chrome.tabs.sendMessage(tabs[0].id, {

            action: "readText"

        });

    });

});



document.getElementById("stopBtn").addEventListener("click", () => {
    speechSynthesis.cancel();

});
