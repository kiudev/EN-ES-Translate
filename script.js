function getElements() {
   return {
      query: document.getElementById("query"),
      translation: document.getElementById("translation"),
      translateBtn: document.getElementById("translateBtn"),
      currentChar: document.getElementById("current"),
      enTranslation: document.getElementById("enTranslation"),
      esTranslation: document.getElementById("esTranslation"),
      enResult: document.getElementById("enResult"),
      esResult: document.getElementById("esResult"),
      copyBtnTranslate: document.getElementById("copyBtnTranslate"),
      copyBtnResult: document.getElementById("copyBtnResult"),
      soundBtnResult: document.getElementById("soundBtnResult"),
      copyTextTranslate: document.getElementById("copyTextTranslate"),
      copyTextResult: document.getElementById("copyTextResult"),
      reverseBtn: document.getElementById("reverseBtn"),
      voiceSelect: document.getElementById("voiceSelect"),
   };
}

const {
   query,
   translation,
   translateBtn,
   currentChar,
   enTranslation,
   esTranslation,
   enResult,
   esResult,
   copyBtnTranslate,
   copyBtnResult,
   soundBtnResult,
   copyTextTranslate,
   copyTextResult,
   reverseBtn,
   voiceSelect,
} = getElements();

const translationLangs = [enTranslation, esTranslation];
const resultLangs = [enResult, esResult];
let translationLang = null;
let resultLang = null;

function langPair(translationLangs, resultLangs) {
   translationLang = "es";
   translationLangs.forEach((lang) => lang.classList.remove("selected"));
   const defaultTranslationLang = translationLangs.find(
      (lang) => lang.getAttribute("value") === translationLang
   );
   if (defaultTranslationLang) {
      defaultTranslationLang.classList.add("selected");
   }

   resultLang = "en";
   resultLangs.forEach((lang) => lang.classList.remove("selected"));
   const defaultResultLang = resultLangs.find(
      (lang) => lang.getAttribute("value") === resultLang
   );
   if (defaultResultLang) {
      defaultResultLang.classList.add("selected");
   }

   translationLangs.forEach((lang) => {
      lang.onclick = () => {
         translationLangs.forEach((l) => l.classList.remove("selected"));
         lang.classList.add("selected");
         translationLang = lang.getAttribute("value");
      };
   });

   resultLangs.forEach((lang) => {
      lang.onclick = () => {
         resultLangs.forEach((l) => l.classList.remove("selected"));
         lang.classList.add("selected");
         resultLang = lang.getAttribute("value");
      };
   });
}

langPair(translationLangs, resultLangs);

currentChar.textContent = 0;
let previousQueryLength = query.value.length;

function constructURL(queryValue, translationLang, resultLang) {
   return `https://api.mymemory.translated.net/get?q=${queryValue}&langpair=${translationLang}|${resultLang}`;
}

function getTranslation() {
   const encodedQuery = encodeURIComponent(query.value);

   const url = constructURL(encodedQuery, translationLang, resultLang);
   console.log("Constructed URL:", url);
   try {
      fetch(url)
         .then((response) => response.json())
         .then((data) => {
            translation.value = data.responseData.translatedText;
         })
         .catch((error) => {
            console.log(error);
         });
   } catch (e) {
      console.error("Invalid URL:", e);
      return;
   }
}

translateBtn.onclick = () => {
   if (!query.value.trim()) {
      translation.value = "";
      alert("Please enter a query to translate!");
   } else {
      getTranslation();
   }
};

query.oninput = () => {
   const currentQueryLength = query.value.length;

   if (currentQueryLength < previousQueryLength) {
      currentChar.textContent = Number(currentChar.textContent) - 1;
      currentChar.textContent = query.value.length;
   } else if (currentQueryLength > previousQueryLength) {
      currentChar.textContent = Number(currentChar.textContent) + 1;
      currentChar.textContent = query.value.length;
   }

   previousQueryLength = currentQueryLength;
};

function copyContent(text) {
   navigator.clipboard.writeText(text);
}

copyBtnTranslate.onclick = () => {
   copyContent(query.value);

   if (query.value.length > 0) {
      copyTextTranslate.textContent = "Copied to clipboard! ✅";
   } else {
      copyTextTranslate.textContent = "Type something to copy! 🥺";
   }

   setTimeout(() => {
      copyTextTranslate.textContent = "";
   }, 3000);
};

copyBtnResult.onclick = () => {
   copyContent(translation.value);

   if (query.value.length > 0) {
      copyTextResult.textContent = "Copied to clipboard! ✅";
   } else {
      copyTextResult.textContent = "No result to copy! 🥺";
   }

   setTimeout(() => {
      copyTextResult.textContent = "";
   }, 3000);
};

function getVoice() {
   const voices = speechSynthesis.getVoices();

   voices.forEach((voice) => {
      const option = document.createElement("option");
      option.style.backgroundColor = "#394150";
      option.value = voice.name;
      option.textContent = voice.name;

      voiceSelect.appendChild(option);
   });
}

speechSynthesis.onvoiceschanged = () => {
   getVoice();
};

function speak(textToSpeech) {
   const utterance = new SpeechSynthesisUtterance(textToSpeech);

   const selectedVoice = voiceSelect.value;
   utterance.voice = speechSynthesis
      .getVoices()
      .find((voice) => voice.name === selectedVoice);

   speechSynthesis.speak(utterance);
}

soundBtnResult.onclick = () => {
   speak(translation.value);
};

reverseBtn.onclick = () => {
   const tempLang = translationLang;
   translationLang = resultLang;
   resultLang = tempLang;

   translationLangs.forEach((lang) => {
      lang.classList.remove("selected");
      if (lang.getAttribute("value") === translationLang) {
         lang.classList.add("selected");
      }
   });

   resultLangs.forEach((lang) => {
      lang.classList.remove("selected");
      if (lang.getAttribute("value") === resultLang) {
         lang.classList.add("selected");
      }
   });

   const temp = translation.value;
   translation.value = query.value;
   query.value = temp;
};
