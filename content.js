chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "readText") {

        
        let selectedText = window.getSelection().toString();

        if (selectedText.length > 0) {
            let speech = new SpeechSynthesisUtterance(selectedText);

            speechSynthesis.speak(speech);

        } else {
            alert("Please select some text first.");
        }
    }

});