
document.getElementById("readBtn").addEventListener("click", () => {


    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

        chrome.tabs.sendMessage(tabs[0].id, {

            action: "readText"

        });

    });

});
//  <!-- test change -->
// pause and resume button add 

document.getElementById("pauseBtn").addEventListener("click", () => {

    if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
    }

});


document.getElementById("resumeBtn").addEventListener("click", () => {

    if (speechSynthesis.paused) {
        speechSynthesis.resume();
    }

});



document.getElementById("stopBtn").addEventListener("click", () => {
    speechSynthesis.cancel();

});
