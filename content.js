// UPDATED VERSION 0.3 CODE
// error handling and improved speech added

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    try {

        if (request.action === "readText") {

            
            let selectedText = window.getSelection().toString();

    
            if (!selectedText || selectedText.trim().length === 0) {

                alert("Please select some text first.");
                return;

            }

            let speech = new SpeechSynthesisUtterance(selectedText);

            speech.onerror = () => {

                console.error("Speech error occurred.");
                alert("Speech error occurred.");

            };

           
            speechSynthesis.speak(speech);

        }

    } catch (error) {

        
        console.error("Unexpected Speech Error:", error);
        alert("Something went wrong while reading text.");

    }

});